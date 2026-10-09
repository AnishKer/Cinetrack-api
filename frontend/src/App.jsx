
import { useEffect, useState } from "react";

const API_URL = "/api/movies";

function App() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState("title");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        limit: String(pagination.limit),
        offset: String(page * pagination.limit),
        sort,
        order,
      });

      if (search.trim()) params.set("search", search.trim());
      if (genre) params.set("genre", genre);
      if (year) params.set("year", year);

      try {
        const response = await fetch(`${API_URL}?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Could not load movies.");
        }

        const data = await response.json();
        setMovies(data.movies);
        setPagination(data.pagination);
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

    fetchMovies();

    return () => controller.abort();
  }, [search, genre, year, sort, order, page, pagination.limit]);

  const resetPage = (setter, value) => {
    setter(value);
    setPage(0);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0c10]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-2xl font-black tracking-tight">
            cine<span className="text-violet-400">track</span>
          </a>

          <span className="text-sm text-zinc-400">Your personal cinema</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="mb-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
            Discover something great
          </p>

          <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
            Every film tells a story.
            <span className="block text-zinc-500">Keep track of yours.</span>
          </h1>

          <p className="mt-5 max-w-xl leading-7 text-zinc-400">
            Explore movies, find your next favourite, and build your personal
            watchlist.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold">Explore movies</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {pagination.total} movies in the catalog
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="search"
              value={search}
              onChange={(e) => resetPage(setSearch, e.target.value)}
              placeholder="Search by title..."
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-violet-400"
            />

            <select
              value={genre}
              onChange={(e) => resetPage(setGenre, e.target.value)}
              className="rounded-xl border border-white/10 bg-[#13151c] px-4 py-3 text-sm outline-none focus:border-violet-400"
            >
              <option value="">All genres</option>
              {["Action", "Crime", "Drama", "Horror", "Romance", "Sci-Fi", "Thriller"].map(
                (item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                )
              )}
            </select>

            <input
              type="number"
              value={year}
              onChange={(e) => resetPage(setYear, e.target.value)}
              placeholder="Release year"
              min="1"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-violet-400"
            />

            <div className="flex gap-2">
              <select
                value={sort}
                onChange={(e) => resetPage(setSort, e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#13151c] px-3 py-3 text-sm"
              >
                <option value="title">Title</option>
                <option value="year">Release year</option>
              </select>

              <button
                onClick={() => resetPage(setOrder, order === "asc" ? "desc" : "asc")}
                className="rounded-xl border border-white/10 px-4 text-sm hover:border-violet-400"
                title="Change sort direction"
              >
                {order === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </section>

        {loading && (
          <p className="py-16 text-center text-zinc-400">Loading movies...</p>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-5 text-red-300">
            {error}
            <button
              onClick={() => setPage((current) => current)}
              className="ml-3 underline"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <p className="py-16 text-center text-zinc-400">
            No movies found. Try changing your filters.
          </p>
        )}

        {!loading && !error && movies.length > 0 && (
          <>
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {movies.map((movie, index) => (
                <article
                  key={movie.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#13151c] transition duration-300 hover:-translate-y-1 hover:border-violet-400/40"
                >
                  <div
                    className={`flex h-48 items-center justify-center bg-gradient-to-br ${
                      index % 2 === 0
                        ? "from-violet-950 to-[#191a27]"
                        : "from-slate-800 to-[#191a27]"
                    }`}
                  >
                    <span className="text-6xl transition group-hover:scale-110">
                      🎬
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300">
                        {movie.genre}
                      </span>
                      <span className="text-sm text-zinc-500">
                        {movie.release_year}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold">{movie.title}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-400">
                      {movie.description || "No description available."}
                    </p>

                    <button
                      disabled
                      title="Watchlist integration is coming next"
                      className="mt-5 w-full cursor-not-allowed rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-500"
                    >
                      + Add to watchlist · Coming next
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-zinc-500">
                Showing {pagination.offset + 1}–
                {Math.min(pagination.offset + pagination.limit, pagination.total)} of{" "}
                {pagination.total}
              </p>

              <div className="flex items-center gap-3">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-30"
                >
                  Previous
                </button>

                <span className="text-sm text-zinc-400">
                  {page + 1} / {Math.max(totalPages, 1)}
                </span>

                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        <footer className="mt-16 border-t border-white/10 py-6 text-center text-sm text-zinc-600">
          CineTrack · Made for people who love films.
        </footer>
      </main>
    </div>
  );
}

export default App;
