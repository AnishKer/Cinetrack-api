
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Watchlist() {
  const { token } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchWatchlist() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/watchlist", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load watchlist.");
        }

        setMovies(data.watchlist);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (token) {
      fetchWatchlist();
    } else {
      setMovies([]);
      setLoading(false);
    }

    return () => controller.abort();
  }, [token]);

  if (loading) {
    return <main className="mx-auto max-w-6xl p-8">Loading watchlist...</main>;
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

    async function updateStatus(movieId, status) {
      setError("");

      try {
        const response = await fetch(`/api/watchlist/${movieId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not update status.");
        }

        setMovies((current) =>
          current.map((movie) =>
            movie.movie_id === movieId ? { ...movie, status } : movie
          )
        );
      } catch (err) {
        setError(err.message || "Something went wrong.");
      }
    }


    
    async function removeMovie(movieId) {
      setError("");
    
      try {
        const response = await fetch(`/api/watchlist/${movieId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Could not remove movie.");
        }
    
        setMovies((current) =>
          current.filter((movie) => movie.movie_id !== movieId)
        );
      } catch (err) {
        setError(err.message || "Something went wrong.");
      }
    }


  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Watchlist</h1>
          <p className="mt-2 text-gray-400">
            {movies.length} {movies.length === 1 ? "movie" : "movies"} saved
          </p>
        </div>

        <Link
          to="/"
          className="rounded-xl border border-white/10 px-4 py-2 hover:border-violet-400"
        >
          Browse movies
        </Link>
      </div>

      {movies.length === 0 ? (
        <div className="rounded-2xl border border-white/10 p-10 text-center">
          <h2 className="text-xl font-semibold">Your watchlist is empty</h2>
          <p className="mt-2 text-gray-400">
            Add movies from the catalog to see them here.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
          >
            Explore movies
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie) => (
            <article
              key={movie.movie_id}
              className="rounded-2xl border border-white/10 bg-white/3 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">{movie.title}</h2>
                <span className="shrink-0 rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-300">
                  {movie.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-400">
                {movie.release_year} · {movie.genre}
              </p>

              <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-300">
                {movie.description}
              </p>

              <p className="mt-4 text-xs text-gray-500">
                Added {new Date(movie.added_at).toLocaleDateString()}
              </p>


                <button
                  onClick={() =>
                    updateStatus(
                      movie.movie_id,
                      movie.status === "planned" ? "watched" : "planned"
                    )
                  }
                  className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold hover:bg-violet-500"
                >
                  {movie.status === "planned"
                    ? "Mark as Watched"
                    : "Mark as Planned"}
                </button>


                <button
                  onClick={() => removeMovie(movie.movie_id)}
                  className="mt-2 w-full rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                >
                  Remove from Watchlist
                </button>

                
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Watchlist;
