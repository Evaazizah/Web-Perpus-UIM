/**
 * ==============================================================================
 * SISTEM REKOMENDASI: ITEM-BASED COLLABORATIVE FILTERING (IBCF)
 * DENGAN PENGUKURAN KEMIRIPAN COSINE SIMILARITY
 * ==============================================================================
 * Sesuai Dokumen Blueprint Bagian 3, 6.C & Arahan Bagian E:
 * 1. Menghitung User-Item Matrix berdasarkan interaksi rating riil di Firestore.
 * 2. Mengukur jarak kemiripan antar-koleksi menggunakan Cosine Similarity:
 *                    sum(R_u,A * R_u,B)
 *      sim(A, B) = ----------------------------------------
 *                  sqrt(sum(R_u,A^2)) * sqrt(sum(R_u,B^2))
 * 3. Memprediksi skor buku yang belum dinilai target user (Weighted Average):
 *                  sum(sim(i, j) * R_u,j)
 *      P_u,i = ------------------------------
 *                    sum(|sim(i, j)|)
 * 4. Fallback Cold-Start: Jika user baru belum memiliki rating, sajikan buku
 *    dengan rata-rata rating dan frekuensi interaksi tertinggi.
 * 5. Konsisten: ID buku dicocokkan sebagai string murni untuk mencegah konflik tipe data.
 */

/**
 * Menghitung Cosine Similarity antara dua vektor rating buku (Item A dan Item B).
 * @param {Object} ratingsA - Objek { userId: ratingValue }
 * @param {Object} ratingsB - Objek { userId: ratingValue }
 * @returns {number} Nilai kemiripan 0.0 s.d. 1.0
 */
export function calculateCosineSimilarity(ratingsA, ratingsB) {
  if (!ratingsA || !ratingsB) return 0;

  // Temukan irisan user yang menilai KEDUA buku A dan B
  const commonUsers = Object.keys(ratingsA).filter((userId) => ratingsB[userId] !== undefined);
  if (commonUsers.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const userId of commonUsers) {
    const rA = Number(ratingsA[userId]);
    const rB = Number(ratingsB[userId]);
    dotProduct += rA * rB;
    normA += rA * rA;
    normB += rB * rB;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Membangun matriks kemiripan untuk seluruh pasangan buku (Item-to-Item Similarity Matrix).
 * @param {Array} ratings - Array data rating [{ id_user, id_buku, nilai_rating }]
 * @returns {Object} { similarityMatrix, bookRatingsMap }
 */
export function buildItemSimilarityMatrix(ratings) {
  const bookRatingsMap = {};

  // Kelompokkan rating per buku: { [id_buku]: { [id_user]: nilai_rating } }
  ratings.forEach(({ id_user, id_buku, nilai_rating }) => {
    if (!id_buku || !id_user || nilai_rating === undefined) return;
    const bookId = String(id_buku);
    const userId = String(id_user);

    if (!bookRatingsMap[bookId]) {
      bookRatingsMap[bookId] = {};
    }
    bookRatingsMap[bookId][userId] = Number(nilai_rating);
  });

  const bookIds = Object.keys(bookRatingsMap);
  const similarityMatrix = {};

  for (let i = 0; i < bookIds.length; i++) {
    const idA = bookIds[i];
    if (!similarityMatrix[idA]) similarityMatrix[idA] = {};

    for (let j = 0; j < bookIds.length; j++) {
      const idB = bookIds[j];

      if (idA === idB) {
        similarityMatrix[idA][idB] = 1.0;
      } else if (similarityMatrix[idB] && similarityMatrix[idB][idA] !== undefined) {
        // Matriks simetris: sim(A, B) = sim(B, A)
        similarityMatrix[idA][idB] = similarityMatrix[idB][idA];
      } else {
        const sim = calculateCosineSimilarity(bookRatingsMap[idA], bookRatingsMap[idB]);
        similarityMatrix[idA][idB] = sim;
      }
    }
  }

  return { similarityMatrix, bookRatingsMap };
}

/**
 * Menghasilkan Rekomendasi Buku untuk Pengguna Tertentu
 * @param {string|null} targetUserId - UID user yang sedang login (null jika Guest)
 * @param {Array} allBooks - Koleksi seluruh buku
 * @param {Array} allRatings - Koleksi seluruh rating riil dari Firestore
 * @param {number} topN - Jumlah rekomendasi yang diminta (default: 4)
 * @returns {Array} Daftar buku rekomendasi disertai skor prediksi dan alasan
 */
export function getRecommendationsForUser(targetUserId, allBooks = [], allRatings = [], topN = 4) {
  if (!allBooks || allBooks.length === 0) return [];

  // 1. KASUS PENGUNJUNG UMUM (GUEST / BELUM LOGIN)
  // Sesuai Blueprint Bagian 4: Fitur rekomendasi menggunakan fallback "Koleksi Terpopuler"
  if (!targetUserId) {
    return getColdStartRecommendations(allBooks, allRatings, topN, 'Koleksi Populer Kampus (Masuk Akun untuk Personalisasi)');
  }

  const cleanUserId = String(targetUserId);

  // 2. KASUS ANGGOTA TANPA RIWAYAT RATING (COLD-START BARU)
  const userRatings = allRatings.filter((r) => String(r.id_user) === cleanUserId);
  const userRatedBookIds = new Set(userRatings.map((r) => String(r.id_buku)));

  if (userRatings.length === 0) {
    return getColdStartRecommendations(
      allBooks,
      allRatings,
      topN,
      'Rekomendasi Awal Populer (Beri Rating Buku untuk Menyesuaikan Selera)'
    );
  }

  // 3. KALKULASI UTAMA: ITEM-BASED COLLABORATIVE FILTERING
  const { similarityMatrix } = buildItemSimilarityMatrix(allRatings);
  const unratedBooks = allBooks.filter((book) => !userRatedBookIds.has(String(book.id)));
  const predictions = [];

  for (const candidateBook of unratedBooks) {
    const candidateId = String(candidateBook.id);
    let weightedScoreSum = 0;
    let similaritySum = 0;
    let mostSimilarRatedBook = null;
    let maxSim = 0;

    for (const userRating of userRatings) {
      const ratedBookId = String(userRating.id_buku);
      const ratingValue = Number(userRating.nilai_rating);

      const sim = similarityMatrix[candidateId]?.[ratedBookId] || 0;

      if (sim > 0) {
        weightedScoreSum += sim * ratingValue;
        similaritySum += sim;

        if (sim > maxSim) {
          maxSim = sim;
          mostSimilarRatedBook = allBooks.find((b) => String(b.id) === ratedBookId);
        }
      }
    }

    if (similaritySum > 0) {
      const predictedScore = weightedScoreSum / similaritySum;
      predictions.push({
        ...candidateBook,
        predictedScore: Number(predictedScore.toFixed(2)),
        similarityScore: Number(maxSim.toFixed(2)),
        isPersonalized: true,
        reason: mostSimilarRatedBook
          ? `Berdasarkan kesukaanmu pada "${mostSimilarRatedBook.judul}"`
          : 'Sesuai dengan riwayat rating bacamu'
      });
    }
  }

  // Urutkan dari prediksi skor tertinggi
  predictions.sort((a, b) => b.predictedScore - a.predictedScore);

  // Jika hasil prediksi masih kurang dari topN (misal karena matriks kemiripan sparse),
  // lengkapi dengan koleksi buku berating tinggi yang belum pernah dibaca
  if (predictions.length < topN) {
    const existingIds = new Set(predictions.map((p) => String(p.id)));
    const coldStartFillers = getColdStartRecommendations(allBooks, allRatings, topN, 'Pilihan Favorit Civitas')
      .filter((b) => !userRatedBookIds.has(String(b.id)) && !existingIds.has(String(b.id)));

    return [...predictions, ...coldStartFillers].slice(0, topN);
  }

  return predictions.slice(0, topN);
}

/**
 * Rekomendasi Fallback (Cold-Start & Pengunjung Umum)
 * Menghitung rata-rata rating dan frekuensi interaksi seluruh pembaca.
 */
export function getColdStartRecommendations(allBooks = [], allRatings = [], topN = 4, customReason = null) {
  if (!allBooks || allBooks.length === 0) return [];

  const bookStats = {};
  allRatings.forEach(({ id_buku, nilai_rating }) => {
    if (!id_buku) return;
    const bId = String(id_buku);
    if (!bookStats[bId]) {
      bookStats[bId] = { total: 0, count: 0 };
    }
    bookStats[bId].total += Number(nilai_rating || 0);
    bookStats[bId].count += 1;
  });

  const scored = allBooks.map((book) => {
    const stat = bookStats[String(book.id)];
    const avg = stat && stat.count > 0 ? stat.total / stat.count : 4.5;
    const count = stat ? stat.count : 0;
    return {
      ...book,
      predictedScore: Number(avg.toFixed(1)),
      interactionCount: count,
      isPersonalized: false,
      reason: customReason || (count > 0 ? `Favorit Komunitas (${count} Ulasan Civitas)` : 'Koleksi Pilihan Pustakawan')
    };
  });

  // Urutkan dari rating dan jumlah interaksi tertinggi
  scored.sort((a, b) => {
    if (b.interactionCount !== a.interactionCount) {
      return b.interactionCount - a.interactionCount;
    }
    return b.predictedScore - a.predictedScore;
  });

  return scored.slice(0, topN);
}

// Dihapus dependensi dummy: array kosong untuk backward compatibility
export const DUMMY_RATINGS = [];
