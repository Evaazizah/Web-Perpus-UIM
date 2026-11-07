"""
Backend Microservice API: Item-Based Collaborative Filtering Recommender
Dibuat menggunakan FastAPI & Pandas / NumPy / Scikit-Learn
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(
    title="Library Recommendation Service API",
    description="Microservice untuk menghitung Item-Based Collaborative Filtering menggunakan Cosine Similarity",
    version="1.0.0"
)

# Model Data Input Rating
class RatingItem(BaseModel):
    id_user: str
    id_buku: int
    nilai_rating: float

class RecommendationRequest(BaseModel):
    user_id: str
    top_n: Optional[int] = 5
    ratings_data: List[RatingItem]

class RecommendedBook(BaseModel):
    id_buku: int
    predicted_score: float
    reason: str

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Item-Based Collaborative Filtering API",
        "algorithm": "Cosine Similarity with Weighted Average"
    }

@app.post("/recommend", response_model=List[RecommendedBook])
def compute_item_collaborative_filtering(request: RecommendationRequest):
    """
    Menghitung rekomendasi buku untuk user_id tertentu berdasarkan data rating seluruh pengguna.
    """
    if not request.ratings_data:
        raise HTTPException(status_code=400, detail="Data rating tidak boleh kosong")

    # 1. Konversi data rating ke format DataFrame Pandas
    data = [
        {"id_user": str(r.id_user), "id_buku": r.id_buku, "rating": float(r.nilai_rating)}
        for r in request.ratings_data
    ]
    df = pd.DataFrame(data)

    # 2. Bangun Pivot Table (User-Item Matrix): Baris = User, Kolom = Buku
    user_item_matrix = df.pivot_table(index="id_user", columns="id_buku", values="rating").fillna(0)

    # 3. Hitung Item-to-Item Similarity Matrix menggunakan Cosine Similarity
    # Transpose agar baris adalah Buku (Items) dan kolom adalah Users
    item_matrix = user_item_matrix.T
    similarity_matrix = cosine_similarity(item_matrix)
    similarity_df = pd.DataFrame(
        similarity_matrix,
        index=item_matrix.index,
        columns=item_matrix.index
    )

    # 4. Filter buku yang sudah pernah dinilai oleh target user
    user_id = str(request.user_id)
    if user_id not in user_item_matrix.index:
        # Fallback Cold-Start: User belum pernah memberi rating, return buku rating rata-rata tertinggi
        mean_ratings = df.groupby("id_buku")["rating"].mean().sort_values(ascending=False)
        top_books = mean_ratings.head(request.top_n)
        return [
            RecommendedBook(
                id_buku=int(book_id),
                predicted_score=round(float(score), 2),
                reason="Rekomendasi Populer (Pengguna Baru)"
            )
            for book_id, score in top_books.items()
        ]

    user_ratings = user_item_matrix.loc[user_id]
    rated_books = user_ratings[user_ratings > 0].index.tolist()
    unrated_books = [b for b in item_matrix.index if b not in rated_books]

    if not unrated_books:
        return []

    # 5. Prediksi skor untuk setiap buku yang belum dinilai
    # Formula Prediksi: sum(sim(i, j) * rating(u, j)) / sum(|sim(i, j)|)
    recommendations = []
    for unrated_book in unrated_books:
        sim_scores = similarity_df.loc[unrated_book, rated_books]
        ratings_given = user_ratings[rated_books]

        numerator = np.dot(sim_scores, ratings_given)
        denominator = np.sum(np.abs(sim_scores))

        if denominator > 0:
            predicted_rating = numerator / denominator
            # Cari buku yang paling mirip yang pernah disukai
            most_similar_book = sim_scores.idxmax()
            recommendations.append({
                "id_buku": int(unrated_book),
                "predicted_score": round(float(predicted_rating), 2),
                "reason": f"Mirip dengan buku ID #{most_similar_book} yang Anda sukai"
            })

    # Urutkan berdasarkan prediksi skor tertinggi
    recommendations.sort(key=lambda x: x["predicted_score"], reverse=True)
    return [RecommendedBook(**item) for item in recommendations[:request.top_n]]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
