import pool from "../config/db.js";
import { movieQuerySchema } from "../validators/movie_validator.js";

export const getMovies = async (req, res, next) => {
  try {
    const result = movieQuerySchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed.",
      });
    }

    const { search, genre, year, sort, order } = result.data;

    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`title ILIKE $${values.length}`);
    }

    if (genre) {
      values.push(genre);
      conditions.push(`genre = $${values.length}`);
    }

    if (year) {
      values.push(year);
      conditions.push(`release_year = $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sortFields = {
      title: "title",
      year: "release_year",
    };

    const sortField = sortFields[sort];

    const query = `
      SELECT id, title, release_year, genre, description
      FROM movies
      ${whereClause}
      ORDER BY ${sortField} ${order};
    `;

    const movies = await pool.query(query, values);

    return res.status(200).json({
      movies: movies.rows,
    });
  } catch (err) {
    next(err);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      ` select id,title,release_year,genre,description from movies where id = $1;`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found.",
      });
    }

    return res.status(200).json({
      movie: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
