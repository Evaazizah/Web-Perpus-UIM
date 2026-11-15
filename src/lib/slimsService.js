/**
 * ==============================================================================
 * ADAPTER INTEGRASI SLIMS 9.8.0 BULIAN (SENAYAN LIBRARY MANAGEMENT SYSTEM)
 * ==============================================================================
 * Sesuai Dokumen Blueprint & Kerangka Penelitian:
 * - Menyediakan jembatan pertukaran data (data exchange boundary) antara OPAC SPA
 *   dengan server backend otomasi SLiMS 9.8.0 Bulian UPT Perpustakaan UIM.
 * - Mendukung format pertukaran: SLiMS XML, JSON Web Service, dan MARC 21 format.
 * - Memetakan metadata bibliografi SLiMS ke skema Cloud Firestore 'books' & 'data_staging'.
 */

const SLIMS_CONFIG_KEY = 'uim_slims_config_v1';

export const DEFAULT_SLIMS_CONFIG = {
  baseUrl: 'http://localhost/slims9_bulian',
  apiUrl: 'http://localhost/slims9_bulian/index.php?p=api',
  sruUrl: 'http://localhost/slims9_bulian/index.php?p=sru',
  apiKey: '',
  syncIntervalHours: 24,
  autoStageNewBiblio: true,
  lastSyncAt: null
};

/**
 * Mengambil konfigurasi SLiMS yang tersimpan
 */
export function getSlimsConfig() {
  try {
    const raw = localStorage.getItem(SLIMS_CONFIG_KEY);
    return raw ? { ...DEFAULT_SLIMS_CONFIG, ...JSON.parse(raw) } : DEFAULT_SLIMS_CONFIG;
  } catch (e) {
    return DEFAULT_SLIMS_CONFIG;
  }
}

/**
 * Menyimpan pembaruan konfigurasi integrasi SLiMS
 */
export function saveSlimsConfig(updates) {
  try {
    const current = getSlimsConfig();
    const updated = { ...current, ...updates };
    localStorage.setItem(SLIMS_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Gagal menyimpan konfigurasi SLiMS:', e);
    return DEFAULT_SLIMS_CONFIG;
  }
}

/**
 * Parser SLiMS XML Export ke Standar Koleksi Bibliografi
 * Format SLiMS XML biasanya memiliki tag: <mods>, <titleInfo>, <name>, <classification>, dll.
 */
export function parseSlimsXml(xmlString) {
  const books = [];
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Parsing format SLiMS MODS / XML
    const records = xmlDoc.getElementsByTagName('record') || xmlDoc.getElementsByTagName('mods');
    
    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      const getText = (tag) => {
        const node = rec.getElementsByTagName(tag)[0];
        return node ? node.textContent.trim() : '';
      };

      const title = getText('title') || getText('judul') || 'Tanpa Judul';
      const author = getText('creator') || getText('author') || getText('penulis') || 'Anonim';
      const isbn = getText('isbn') || getText('identifier') || '-';
      const publisher = getText('publisher') || getText('penerbit') || 'UPT Perpustakaan UIM';
      const year = getText('year') || getText('dateIssued') || getText('tahun') || String(new Date().getFullYear());
      const callNumber = getText('callNumber') || getText('no_panggil') || 'DDC-000';
      const subject = getText('subject') || getText('kategori') || 'Umum';

      books.push({
        id: `slims-${Date.now()}-${i + 1}`,
        judul: title,
        penulis: author,
        isbn,
        penerbit: publisher,
        tahun: Number(year) || new Date().getFullYear(),
        kategori: subject,
        lokasi_rak: callNumber,
        sinopsis: getText('abstract') || getText('description') || `Koleksi resmi SLiMS 9.8.0 Bulian UIM. No Panggil: ${callNumber}`,
        cover_url: getText('image') || `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80`,
        salin: 2,
        dipinjam: 0,
        sumber_integrasi: 'SLiMS 9.8.0 Bulian (XML Import)'
      });
    }
  } catch (error) {
    console.error('Gagal parsing XML SLiMS:', error);
    throw new Error('Format file XML SLiMS tidak valid: ' + error.message);
  }
  return books;
}

/**
 * Parser SLiMS JSON / REST API Response
 */
export function parseSlimsJson(jsonData) {
  if (!Array.isArray(jsonData) && !jsonData.data) {
    throw new Error('Data JSON SLiMS harus berupa array atau objek bertingkat { data: [...] }');
  }

  const rawList = Array.isArray(jsonData) ? jsonData : jsonData.data;
  return rawList.map((item, index) => ({
    id: String(item.biblio_id || item.id || `slims-${Date.now()}-${index}`),
    judul: item.title || item.judul || 'Tanpa Judul',
    penulis: item.author || item.penulis || item.authors?.[0]?.name || 'Anonim',
    isbn: item.isbn_issn || item.isbn || '-',
    penerbit: item.publisher || item.penerbit || 'UPT Perpustakaan UIM',
    tahun: Number(item.publish_year || item.tahun) || new Date().getFullYear(),
    kategori: item.topic || item.kategori || item.subject || 'Umum',
    lokasi_rak: item.call_number || item.lokasi_rak || 'Rak Umum',
    sinopsis: item.notes || item.sinopsis || 'Deskripsi koleksi katalog SLiMS 9.8.0 Bulian UIM.',
    cover_url: item.image || item.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    salin: Number(item.items_count || item.salin) || 2,
    dipinjam: 0,
    sumber_integrasi: 'SLiMS 9.8.0 Bulian (REST API Sync)'
  }));
}

/**
 * Ekspor Koleksi ke Format SLiMS JSON Bulk Import
 */
export function exportToSlimsJson(books) {
  return JSON.stringify(
    books.map((b) => ({
      title: b.judul,
      author: b.penulis,
      isbn_issn: b.isbn || '',
      publisher: b.penerbit || '',
      publish_year: b.tahun || '',
      call_number: b.lokasi_rak || '',
      topic: b.kategori || '',
      notes: b.sinopsis || '',
      items_count: b.salin || 1
    })),
    null,
    2
  );
}

/**
 * Menguji Koneksi ke Endpoint SLiMS 9.8.0
 */
export async function testSlimsConnection(endpointUrl) {
  try {
    const targetUrl = endpointUrl || getSlimsConfig().apiUrl;
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      mode: 'cors'
    });

    if (res.ok) {
      return { success: true, message: `Terhubung ke SLiMS Server (HTTP ${res.status})` };
    } else {
      return {
        success: false,
        message: `SLiMS merespons status ${res.status}: ${res.statusText}. Pastikan CORS dan Web Service diaktifkan di sysconfig.inc.php.`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Tidak dapat menjangkau server SLiMS (${error.message}). Pastikan Apache/Nginx SLiMS lokal sedang berjalan.`
    };
  }
}

