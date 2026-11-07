/**
 * ==============================================================================
 * SISTEM REKOMENDASI: ITEM-BASED COLLABORATIVE FILTERING
 * ==============================================================================
 * 
 * Konsep:
 * Rekomendasi didasarkan pada tingkat kemiripan (similarity) antar buku (items)
 * berdasarkan pola rating yang diberikan oleh seluruh pengguna.
 * 
 * Alur Kerja:
 * 1. Membangun Matriks Rating (User-Item Matrix).
 * 2. Menghitung Nilai Kemiripan Antar Buku (Cosine Similarity).
 * 3. Memprediksi Skor Buku yang belum pernah dibaca/dirating oleh target user.
 * 4. Mengurutkan dan mengembalikan Top-N buku dengan prediksi skor tertinggi.
 * 5. Menangani Kasus 'Cold Start' (pengguna baru yang belum memberi rating).
 */

/**
 * Menghitung Cosine Similarity antara dua vektor rating buku (Item A dan Item B).
 * 
 * Rumus Cosine Similarity:
 *                sum(Rating_u,A * Rating_u,B)
 * sim(A, B) = ------------------------------------
 *             sqrt(sum(Rating_u,A^2)) * sqrt(sum(Rating_u,B^2))
 * 
 * @param {Object} ratingsA - Objek { userId: rating } untuk Buku A
 * @param {Object} ratingsB - Objek { userId: rating } untuk Buku B
 * @returns {number} Nilai kemiripan antara 0 (tidak mirip sama sekali) hingga 1 (sangat identik)
 */
export function calculateCosineSimilarity(ratingsA, ratingsB) {
  // Dapatkan irisan user yang memberi rating pada KEDUA buku A dan B
  const commonUsers = Object.keys(ratingsA).filter((userId) => ratingsB[userId] !== undefined);

  // Jika tidak ada user yang sama-sama menilai kedua buku, kemiripan = 0
  if (commonUsers.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const userId of commonUsers) {
    const rA = ratingsA[userId];
    const rB = ratingsB[userId];
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
 * 
 * @param {Array} ratings - Array data rating [{ id_user, id_buku, nilai_rating }]
 * @returns {Object} Matrix kemiripan: { [bukuIdA]: { [bukuIdB]: similarityScore } }
 */
export function buildItemSimilarityMatrix(ratings) {
  // 1. Kelompokkan rating per buku: { [id_buku]: { [id_user]: nilai_rating } }
  const bookRatingsMap = {};

  ratings.forEach(({ id_user, id_buku, nilai_rating }) => {
    const bookId = String(id_buku);
    if (!bookRatingsMap[bookId]) {
      bookRatingsMap[bookId] = {};
    }
    bookRatingsMap[bookId][id_user] = Number(nilai_rating);
  });

  const bookIds = Object.keys(bookRatingsMap);
  const similarityMatrix = {};

  // 2. Hitung kemiripan setiap pasangan buku (A dan B)
  for (let i = 0; i < bookIds.length; i++) {
    const idA = bookIds[i];
    if (!similarityMatrix[idA]) similarityMatrix[idA] = {};

    for (let j = 0; j < bookIds.length; j++) {
      const idB = bookIds[j];

      if (idA === idB) {
        similarityMatrix[idA][idB] = 1.0; // Buku identik dengan dirinya sendiri
      } else if (similarityMatrix[idB] && similarityMatrix[idB][idA] !== undefined) {
        // Matriks simetris: sim(A, B) = sim(B, A), hemat perhitungan
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
 * Menghasilkan Rekomendasi Buku untuk User Tertentu (Target User).
 * 
 * @param {string|number} targetUserId - ID user yang sedang login
 * @param {Array} allBooks - Seluruh daftar buku dari database
 * @param {Array} allRatings - Seluruh data rating dari database
 * @param {number} topN - Jumlah rekomendasi yang ingin ditampilkan (default: 4)
 * @returns {Array} Daftar buku rekomendasi disertai skor prediksi dan alasan
 */
export function getRecommendationsForUser(targetUserId, allBooks, allRatings, topN = 4) {
  if (!allBooks || allBooks.length === 0) return [];
  if (!allRatings || allRatings.length === 0) {
    // Fallback Cold Start: Ambil buku teratas jika belum ada rating sama sekali
    return allBooks.slice(0, topN).map(b => ({ ...b, predictedScore: 5.0, reason: 'Buku Pilihan Populer' }));
  }

  // 1. Ekstrak buku-buku yang telah diberi rating oleh target user
  const userRatings = allRatings.filter((r) => String(r.id_user) === String(targetUserId));
  const userRatedBookIds = new Set(userRatings.map((r) => String(r.id_buku)));

  // Kasus COLD START (User baru yang belum pernah memberikan rating):
  // Rekomendasikan buku dengan rata-rata rating tertinggi dari seluruh user
  if (userRatings.length === 0) {
    return getColdStartRecommendations(allBooks, allRatings, topN);
  }

  // 2. Bangun Matriks Kemiripan Antar Item
  const { similarityMatrix } = buildItemSimilarityMatrix(allRatings);

  // 3. Hitung prediksi rating untuk setiap buku yang BELUM pernah dinilai oleh user
  const unratedBooks = allBooks.filter((book) => !userRatedBookIds.has(String(book.id)));
  const predictions = [];

  for (const candidateBook of unratedBooks) {
    const candidateId = String(candidateBook.id);
    let weightedScoreSum = 0;
    let similaritySum = 0;
    let mostSimilarRatedBook = null;
    let maxSim = -1;

    // Bandingkan candidate book dengan buku-buku yang sudah dirating user
    for (const userRating of userRatings) {
      const ratedBookId = String(userRating.id_buku);
      const ratingValue = Number(userRating.nilai_rating);

      const sim = similarityMatrix[candidateId]?.[ratedBookId] || 0;

      if (sim > 0) {
        weightedScoreSum += sim * ratingValue;
        similaritySum += sim;

        if (sim > maxSim) {
          maxSim = sim;
          mostSimilarRatedBook = allBooks.find(b => String(b.id) === ratedBookId);
        }
      }
    }

    // Hitung prediksi rating tertimbang (Weighted Average)
    if (similaritySum > 0) {
      const predictedScore = weightedScoreSum / similaritySum;
      predictions.push({
        ...candidateBook,
        predictedScore: Number(predictedScore.toFixed(2)),
        similarityScore: Number(maxSim.toFixed(2)),
        reason: mostSimilarRatedBook 
          ? `Mirip dengan buku "${mostSimilarRatedBook.judul}" yang pernah kamu sukai`
          : 'Sesuai dengan selera bacamu'
      });
    }
  }

  // 4. Urutkan dari predicted score tertinggi
  predictions.sort((a, b) => b.predictedScore - a.predictedScore);

  // Jika hasil prediksi kurang dari topN, lengkapi dengan buku populer
  if (predictions.length < topN) {
    const existingIds = new Set(predictions.map((p) => String(p.id)));
    const coldStartFillers = getColdStartRecommendations(allBooks, allRatings, topN)
      .filter((b) => !userRatedBookIds.has(String(b.id)) && !existingIds.has(String(b.id)));
    
    return [...predictions, ...coldStartFillers].slice(0, topN);
  }

  return predictions.slice(0, topN);
}

/**
 * Strategi Fallback untuk Pengguna Baru (Cold Start):
 * Menghitung rata-rata rating untuk tiap buku dan mengurutkan buku terbaik.
 */
function getColdStartRecommendations(allBooks, allRatings, topN = 4) {
  const bookStats = {};

  allRatings.forEach(({ id_buku, nilai_rating }) => {
    const bId = String(id_buku);
    if (!bookStats[bId]) {
      bookStats[bId] = { total: 0, count: 0 };
    }
    bookStats[bId].total += Number(nilai_rating);
    bookStats[bId].count += 1;
  });

  const scoredBooks = allBooks.map((book) => {
    const stat = bookStats[String(book.id)];
    const avgScore = stat ? stat.total / stat.count : 4.0;
    return {
      ...book,
      predictedScore: Number(avgScore.toFixed(2)),
      reason: stat ? `Pilihan Favorit Komunitas (⭐ ${avgScore.toFixed(1)})` : 'Buku Rekomendasi Populer'
    };
  });

  scoredBooks.sort((a, b) => b.predictedScore - a.predictedScore);
  return scoredBooks.slice(0, topN);
}

/**
 * Data Simulasi Rating (Digunakan ketika database lokal/Supabase belum terisi data)
 * Memetakan pola preferensi buku antarpembaca:
 * - User 101, 102 menyukai buku Sastra (Laskar Pelangi, Bumi Manusia)
 * - User 103, 104 menyukai buku Koding (Clean Code, Pragmatic Programmer)
 * - User 105 menyukai buku Self-Development (Filosofi Teras, Atomic Habits)
 */
export const DUMMY_RATINGS = [];
