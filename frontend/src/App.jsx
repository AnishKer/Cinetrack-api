
import { useState } from "react";

const movies = [
  { id: 1, title: "Interstellar", year: 2014, genre: "Sci-Fi", rating: "8.7", emoji: "🚀" },
  { id: 2, title: "Inception", year: 2010, genre: "Sci-Fi", rating: "8.8", emoji: "🌀" },
  { id: 3, title: "The Dark Knight", year: 2008, genre: "Action", rating: "9.0", emoji: "🦇" },
  { id: 4, title: "Parasite", year: 2019, genre: "Thriller", rating: "8.5", emoji: "🏠" },
  { id: 5, title: "Whiplash", year: 2014, genre: "Drama", rating: "8.5", emoji: "🥁" },
  { id: 6, title: "Dune", year: 2021, genre: "Sci-Fi", rating: "8.0", emoji: "🏜️" },
];

function App() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Discover");

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0c10]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button
            onClick={() => setActiveTab("Discover")}
            className="text-2xl font-black tracking-tight"
          >
            cine<span className="text-violet-400">track</span>
            <span className="ml-2 text-xs font-medium text-zinc-500">BETA</span>
          </button>

          <nav className="hidden gap-8 md:flex">
            {["Discover", "My Watchlist", "Reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm transition ${
                  activeTab === tab
                    ? "text-violet-400"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <button className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold transition hover:bg-violet-400">
            Sign in
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="mb-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
            Your personal cinema
          </p>

          <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
            Every film tells a story.
            <span className="block text-zinc-500">
              Keep track of yours.
            </span>
          </h1>

          <p className="mt-5 max-w-xl leading-7 text-zinc-400">
            Discover films, build your watchlist, and keep a record of
            everything you watch and love.
          </p>
        </section>

        <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">{activeTab}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Find your next favourite film.
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search movies..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-500 focus:border-violet-400 sm:max-w-xs"
          />
        </section>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMovies.map((movie, index) => (
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
                <span className="text-6xl transition duration-300 group-hover:scale-110">
                  {movie.emoji}
                </span>
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300">
                    {movie.genre}
                  </span>
                  <span className="text-sm text-amber-300">
                    ★ {movie.rating}
                  </span>
                </div>

                <h3 className="text-lg font-bold">{movie.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{movie.year}</p>

                <button
                  onClick={() => setActiveTab("My Watchlist")}
                  className="mt-5 w-full rounded-xl border border-white/10 py-2.5 text-sm font-semibold transition hover:border-violet-400 hover:bg-violet-400/10"
                >
                  + Add to watchlist
                </button>
              </div>
            </article>
          ))}
        </section>

        {filteredMovies.length === 0 && (
          <p className="py-16 text-center text-zinc-400">
            No movies match your search.
          </p>
        )}

        <footer className="mt-16 border-t border-white/10 py-6 text-center text-sm text-zinc-600">
          CineTrack · Made for people who love films.
        </footer>
      </main>
    </div>
  );
}

export default App;
