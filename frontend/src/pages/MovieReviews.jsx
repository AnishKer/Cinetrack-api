
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function MovieReviews({ movieId }) {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState("8");
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadReviews(signal) {
    try {
      const response = await fetch(`/api/movies/${movieId}/reviews`, {
        signal,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load reviews.");
      }

      setReviews(data.reviews);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Could not load reviews.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    loadReviews(controller.signal);
    return () => controller.abort();
  }, [movieId]);

  async function submitReview(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch(`/api/movies/${movieId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number(rating),
          review_text: reviewText.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not submit review.");
      }

      setReviewText("");
      setMessage("Review submitted successfully.");
      await loadReviews();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteReview() {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/movies/${movieId}/reviews`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Could not delete review.");
      }

      setReviews((current) =>
        current.filter((review) => review.user_id !== user?.id)
      );
      setMessage("Review deleted.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  return (
    <section className="mt-8 border-t border-white/10 pt-6">
      <h3 className="text-xl font-bold">Reviews</h3>

      {user && (
        <form onSubmit={submitReview} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Rating (1-10)
            </label>
            <select
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2"
            >
              {Array.from({ length: 10 }, (_, index) => index + 1).map(
                (value) => (
                  <option key={value} value={value}>
                    {value}/10
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Your review
            </label>
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              required
              rows={3}
              maxLength={2000}
              placeholder="What did you think of this movie?"
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-violet-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-violet-600 px-5 py-2.5 font-semibold hover:bg-violet-500 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </form>
      )}

      {!user && (
        <p className="mt-3 text-sm text-gray-400">
          Log in to write a review.
        </p>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {message && <p className="mt-4 text-sm text-green-400">{message}</p>}

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-400">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews yet.</p>
        ) : (
          reviews.map((review) => {
            return (
            
            <article
                
              key={review.id}
              className="rounded-xl border border-white/10 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">
                  {review.username || "User"}
                </p>
                <span className="text-sm text-violet-300">
                  {review.rating}/10
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                {review.review_text}
              </p>

              
                {user && String(review.user_id) === String(user.id) && (
                  <button
                    onClick={deleteReview}
                    className="mt-3 text-sm text-red-400 hover:text-red-300"
                  >
                    Delete my review
                  </button>
                )}

            </article>
          )})
        )}
      </div>
    </section>
  );
}

export default MovieReviews;
