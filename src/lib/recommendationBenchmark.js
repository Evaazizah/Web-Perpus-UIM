/**
 * ==============================================================================
 * MODUL BENCHMARK & EVALUASI PENELITIAN: COLLABORATIVE FILTERING
 * ==============================================================================
 * Sesuai Kerangka Riset:
 * "Pengembangan Portal Web Perpustakaan Menggunakan Metode Collaborative Filtering"
 * - Menyediakan dataset evaluasi penelitian (Ground Truth Dataset).
 * - Menghitung metrik akurasi pengujian:
 *   1. Cosine Similarity Matrix (Item-to-Item)
 *   2. Mean Absolute Error (MAE)
 *   3. Root Mean Squared Error (RMSE)
 *   4. Precision@K
 *   5. Recall@K
 *   6. F1-Score@K
 * - Memungkinkan Pustakawan & Peneliti menguji performa algoritma secara empiris.
 */

import { calculateCosineSimilarity, buildItemSimilarityMatrix } from './recommendationEngine.js';

/**
 * Dataset Uji Penelitian Terstandarisasi (10 Pengguna, 10 Koleksi Lintas Subjek)
 */
export const RESEARCH_BENCHMARK_DATASET = {
  books: [
    { id: 'B01', judul: 'Metodologi Studi Islam Kontemporer', kategori: 'Agama Islam' },
    { id: 'B02', judul: 'Filsafat Hukum Islam (Ushul Fiqh)', kategori: 'Agama Islam' },
    { id: 'B03', judul: 'Tafsir Ayat-Ayat Ahkam', kategori: 'Agama Islam' },
    { id: 'B04', judul: 'Pengantar Kecerdasan Buatan dan Robotika', kategori: 'Teknologi' },
    { id: 'B05', judul: 'Rekayasa Perangkat Lunak Berorientasi Objek', kategori: 'Teknologi' },
    { id: 'B06', judul: 'Struktur Data dan Algoritma Lanjut', kategori: 'Teknologi' },
    { id: 'B07', judul: 'Teknologi Budidaya Tembakau Madura', kategori: 'Pertanian' },
    { id: 'B08', judul: 'Agribisnis Komoditas Garam dan Jagung', kategori: 'Pertanian' },
    { id: 'B09', judul: 'Manajemen Keuangan Syariah Modern', kategori: 'Ekonomi' },
    { id: 'B10', judul: 'Akuntansi Perbankan Syariah', kategori: 'Ekonomi' }
  ],
  ratings: [
    // Kelompok Mahasiswa PAI / Syariah
    { id_user: 'M01', id_buku: 'B01', nilai_rating: 5 },
    { id_user: 'M01', id_buku: 'B02', nilai_rating: 5 },
    { id_user: 'M01', id_buku: 'B03', nilai_rating: 4 },
    { id_user: 'M02', id_buku: 'B01', nilai_rating: 4 },
    { id_user: 'M02', id_buku: 'B02', nilai_rating: 5 },
    { id_user: 'M03', id_buku: 'B02', nilai_rating: 4 },
    { id_user: 'M03', id_buku: 'B03', nilai_rating: 5 },

    // Kelompok Mahasiswa Informatika / Teknik
    { id_user: 'M04', id_buku: 'B04', nilai_rating: 5 },
    { id_user: 'M04', id_buku: 'B05', nilai_rating: 5 },
    { id_user: 'M04', id_buku: 'B06', nilai_rating: 4 },
    { id_user: 'M05', id_buku: 'B04', nilai_rating: 4 },
    { id_user: 'M05', id_buku: 'B05', nilai_rating: 5 },
    { id_user: 'M06', id_buku: 'B05', nilai_rating: 5 },
    { id_user: 'M06', id_buku: 'B06', nilai_rating: 5 },

    // Kelompok Mahasiswa Pertanian
    { id_user: 'M07', id_buku: 'B07', nilai_rating: 5 },
    { id_user: 'M07', id_buku: 'B08', nilai_rating: 5 },
    { id_user: 'M08', id_buku: 'B07', nilai_rating: 4 },
    { id_user: 'M08', id_buku: 'B08', nilai_rating: 5 },

    // Kelompok Mahasiswa Ekonomi Syariah
    { id_user: 'M09', id_buku: 'B09', nilai_rating: 5 },
    { id_user: 'M09', id_buku: 'B10', nilai_rating: 5 },
    { id_user: 'M09', id_buku: 'B02', nilai_rating: 4 },
    { id_user: 'M10', id_buku: 'B09', nilai_rating: 4 },
    { id_user: 'M10', id_buku: 'B10', nilai_rating: 5 }
  ]
};

/**
 * Menghitung Seluruh Pasangan Kemiripan Cosine untuk Uji Analisis Matriks
 */
export function evaluateSimilarityMatrix(dataset = RESEARCH_BENCHMARK_DATASET) {
  const { similarityMatrix, bookRatingsMap } = buildItemSimilarityMatrix(dataset.ratings);
  const matrixList = [];

  const bookIds = dataset.books.map((b) => b.id);

  for (let i = 0; i < bookIds.length; i++) {
    for (let j = i + 1; j < bookIds.length; j++) {
      const idA = bookIds[i];
      const idB = bookIds[j];
      const bookA = dataset.books.find((b) => b.id === idA);
      const bookB = dataset.books.find((b) => b.id === idB);
      const sim = similarityMatrix[idA]?.[idB] || 0;

      if (sim > 0) {
        matrixList.push({
          bookAId: idA,
          bookATitle: bookA?.judul || idA,
          bookBId: idB,
          bookBTitle: bookB?.judul || idB,
          similarity: Number(sim.toFixed(4)),
          kategoriA: bookA?.kategori,
          kategoriB: bookB?.kategori,
          isSameCategory: bookA?.kategori === bookB?.kategori
        });
      }
    }
  }

  // Urutkan berdasarkan nilai kemiripan tertinggi
  matrixList.sort((a, b) => b.similarity - a.similarity);

  return {
    rawMatrix: similarityMatrix,
    topPairs: matrixList,
    totalPairsEvaluated: (bookIds.length * (bookIds.length - 1)) / 2,
    activePairs: matrixList.length
  };
}

/**
 * Menghitung Evaluasi Kinerja Rekomendasi (MAE, RMSE, Precision@K, Recall@K)
 * Menggunakan teknik Leave-One-Out Cross Validation
 * @param {number} k - Nilai ambang Top-K rekomendasi (default: 3)
 * @param {number} relevanceThreshold - Ambang batas rating yang dianggap relevan (default: 4.0)
 */
export function runRecommendationEvaluation(k = 3, relevanceThreshold = 4.0) {
  const dataset = RESEARCH_BENCHMARK_DATASET;
  const ratings = dataset.ratings;

  let totalAbsoluteError = 0;
  let totalSquaredError = 0;
  let predictionCount = 0;

  let precisionSum = 0;
  let recallSum = 0;
  let userEvalCount = 0;

  // Kumpulkan pengguna unik yang memiliki lebih dari 1 rating (dapat diuji)
  const userMap = {};
  ratings.forEach((r) => {
    if (!userMap[r.id_user]) userMap[r.id_user] = [];
    userMap[r.id_user].push(r);
  });

  const testableUsers = Object.keys(userMap).filter((uid) => userMap[uid].length >= 2);

  testableUsers.forEach((userId) => {
    const userRatings = userMap[userId];

    // Uji Leave-One-Out untuk setiap rating user
    for (let testIdx = 0; testIdx < userRatings.length; testIdx++) {
      const testItem = userRatings[testIdx];
      const trainRatings = ratings.filter(
        (r) => !(r.id_user === userId && r.id_buku === testItem.id_buku)
      );

      // Hitung similarity matrix tanpa testItem
      const { similarityMatrix } = buildItemSimilarityMatrix(trainRatings);

      // Prediksi rating testItem
      const otherUserRatings = userRatings.filter((_, idx) => idx !== testIdx);
      let weightedSum = 0;
      let simSum = 0;

      otherUserRatings.forEach((ur) => {
        const sim = similarityMatrix[testItem.id_buku]?.[ur.id_buku] || 0;
        if (sim > 0) {
          weightedSum += sim * ur.nilai_rating;
          simSum += sim;
        }
      });

      if (simSum > 0) {
        const predictedRating = weightedSum / simSum;
        const actualRating = testItem.nilai_rating;
        const err = Math.abs(actualRating - predictedRating);

        totalAbsoluteError += err;
        totalSquaredError += err * err;
        predictionCount++;
      }
    }

    // Hitung Precision@K dan Recall@K
    const relevantItems = new Set(
      userRatings.filter((r) => r.nilai_rating >= relevanceThreshold).map((r) => r.id_buku)
    );

    if (relevantItems.size > 0) {
      // Ambil seluruh prediksi untuk buku yang relevan
      const trainRatings = ratings.filter((r) => r.id_user !== userId);
      const { similarityMatrix } = buildItemSimilarityMatrix(trainRatings);

      const candidateScores = [];
      dataset.books.forEach((book) => {
        let weightedSum = 0;
        let simSum = 0;

        userRatings.forEach((ur) => {
          const sim = similarityMatrix[book.id]?.[ur.id_buku] || 0;
          if (sim > 0) {
            weightedSum += sim * ur.nilai_rating;
            simSum += sim;
          }
        });

        if (simSum > 0) {
          candidateScores.push({ bookId: book.id, score: weightedSum / simSum });
        }
      });

      candidateScores.sort((a, b) => b.score - a.score);
      const topKRecommended = candidateScores.slice(0, k).map((c) => c.bookId);

      const hitCount = topKRecommended.filter((id) => relevantItems.has(id)).length;
      const precision = hitCount / k;
      const recall = hitCount / relevantItems.size;

      precisionSum += precision;
      recallSum += recall;
      userEvalCount++;
    }
  });

  const mae = predictionCount > 0 ? totalAbsoluteError / predictionCount : 0;
  const rmse = predictionCount > 0 ? Math.sqrt(totalSquaredError / predictionCount) : 0;
  const avgPrecision = userEvalCount > 0 ? precisionSum / userEvalCount : 0;
  const avgRecall = userEvalCount > 0 ? recallSum / userEvalCount : 0;
  const f1Score =
    avgPrecision + avgRecall > 0 ? (2 * avgPrecision * avgRecall) / (avgPrecision + avgRecall) : 0;

  return {
    k,
    relevanceThreshold,
    totalTestSamples: predictionCount,
    evaluatedUsers: userEvalCount,
    mae: Number(mae.toFixed(4)),
    rmse: Number(rmse.toFixed(4)),
    precisionAtK: Number(avgPrecision.toFixed(4)),
    recallAtK: Number(avgRecall.toFixed(4)),
    f1ScoreAtK: Number(f1Score.toFixed(4)),
    ratingScale: '1 - 5',
    timestamp: new Date().toISOString()
  };
}
