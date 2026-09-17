import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const movies = [
  {
    title: "Interstellar",
    releaseYear: 2014,
    genre: "Sci-Fi",
    description:
      "A team of explorers travels through a wormhole in search of a new home for humanity.",
  },
  {
    title: "Inception",
    releaseYear: 2010,
    genre: "Sci-Fi",
    description:
      "A skilled extractor enters people's dreams to steal and plant information.",
  },
  {
    title: "The Dark Knight",
    releaseYear: 2008,
    genre: "Action",
    description:
      "Batman faces a criminal mastermind who pushes Gotham into chaos.",
  },
  {
    title: "The Shawshank Redemption",
    releaseYear: 1994,
    genre: "Drama",
    description:
      "A banker forms an unlikely friendship while serving a life sentence in prison.",
  },
  {
    title: "The Godfather",
    releaseYear: 1972,
    genre: "Crime",
    description:
      "The aging patriarch of a crime family transfers control of his empire to his son.",
  },
  {
    title: "Pulp Fiction",
    releaseYear: 1994,
    genre: "Crime",
    description:
      "Several interconnected stories unfold around criminals in Los Angeles.",
  },
  {
    title: "The Matrix",
    releaseYear: 1999,
    genre: "Sci-Fi",
    description:
      "A hacker discovers that reality is not what it appears to be.",
  },
  {
    title: "Parasite",
    releaseYear: 2019,
    genre: "Thriller",
    description:
      "A struggling family gradually becomes involved with a wealthy household.",
  },
  {
    title: "Whiplash",
    releaseYear: 2014,
    genre: "Drama",
    description:
      "A young drummer faces an intense instructor determined to push him to greatness.",
  },
  {
    title: "Avengers: Endgame",
    releaseYear: 2019,
    genre: "Action",
    description:
      "The Avengers attempt to reverse the devastating events that changed their universe.",
  },
  {
    title: "Dune",
    releaseYear: 2021,
    genre: "Sci-Fi",
    description:
      "A young noble becomes involved in a struggle over a valuable desert planet.",
  },
  {
    title: "Get Out",
    releaseYear: 2017,
    genre: "Horror",
    description:
      "A young man discovers disturbing secrets during a visit to his girlfriend's family.",
  },
  {
    title: "La La Land",
    releaseYear: 2016,
    genre: "Romance",
    description:
      "An aspiring actress and a jazz musician pursue their dreams while falling in love.",
  },
  {
    title: "The Social Network",
    releaseYear: 2010,
    genre: "Drama",
    description:
      "The story of the creation and early growth of a major social networking platform.",
  },
  {
    title: "Mad Max: Fury Road",
    releaseYear: 2015,
    genre: "Action",
    description:
      "A group of survivors attempts to escape across a dangerous post-apocalyptic wasteland.",
  },
];

const seedMovies = async () => {
  try {
    let insertedCount = 0;

    for (const movie of movies) {
      const result = await pool.query(
        `
          INSERT INTO movies (title, release_year, genre, description)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (title, release_year) DO NOTHING
        `,
        [movie.title, movie.releaseYear, movie.genre, movie.description],
      );

      insertedCount += result.rowCount;
    }

    console.log(
      `${insertedCount} new movies inserted. ${movies.length - insertedCount} already existed.`,
    );
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await pool.end();
  }
};

seedMovies();
