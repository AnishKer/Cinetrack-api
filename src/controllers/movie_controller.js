import pool from "../config/db.js";
import { movieQuerySchema } from "../validators/movie_validator.js";
import { idParamSchema } from "../validators/param_validator.js";

export const getMovies = async (req, res, next) => {
  try {
    const result = movieQuerySchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed.",
      });
    }

    const { search, genre, year, sort, order, limit, offset } = result.data;

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

    const limitParam = values.length + 1;
    const offsetParam = values.length + 2;

    values.push(limit, offset);

    const query = `
      SELECT id, title, release_year, genre, description
      FROM movies
      ${whereClause}
      ORDER BY ${sortField} ${order}
      LIMIT $${limitParam}
      OFFSET $${offsetParam};
    `;

    const movies = await pool.query(query, values);

    const countResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM movies
      ${whereClause};
      `,
      values.slice(0, -2),
    );

    return res.status(200).json({
      movies: movies.rows,
      pagination: {
        limit,
        offset,
        total: Number(countResult.rows[0].total),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const result = idParamSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid movie ID.",
      });
    }

    const { id } = result.data;

    const movieResult = await pool.query(
      `
      SELECT id, title, release_year, genre, description
      FROM movies
      WHERE id = $1;
      `,
      [id],
    );

    if (movieResult.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found.",
      });
    }

    return res.status(200).json({
      movie: movieResult.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
