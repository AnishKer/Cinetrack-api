import pool from "../config/db.js";
import { updateWatchlistSchema } from "../validators/watchlist_validator.js";
import { movieIdParamSchema } from "../validators/param_validator.js";

export const addMovie = async (req, res, next) => {
  try {
    const result = movieIdParamSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid movie ID.",
      });
    }

    const { movieId } = result.data;
    const movieResult = await pool.query(
      `
      select id from movies where id=$1
      `,
      [movieId],
    );

    if (movieResult.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found.",
      });
    }

    const userId = req.user.userId;

    await pool.query(
      `insert into watchlist_items (user_id,movie_id) values ($1,$2)`,
      [userId, movieId],
    );

    return res.status(201).json({
      message: "Movie added to watchlist.",
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Movie already in the watchlist.",
      });
    }
    next(err);
  }
};

export const getWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    console.log("USER ID:", userId);

    const result = await pool.query(
      `
            select w.id,w.movie_id,m.title,m.release_year,m.genre,m.description,w.status,w.added_at,w.watched_at from watchlist_items w join movies m on w.movie_id = m.id where w.user_id = $1 order by w.added_at desc;
            `,
      [userId],
    );

    return res.status(200).json({
      watchlist: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const bodyResult = updateWatchlistSchema.safeParse(req.body);

    if (!bodyResult.success) {
      return res.status(400).json({
        message: "Validation failed.",
      });
    }

    const paramResult = movieIdParamSchema.safeParse(req.params);

    if (!paramResult.success) {
      return res.status(400).json({
        message: "Invalid movie ID.",
      });
    }
    const { status } = bodyResult.data;
    const { movieId } = paramResult.data;
    const userId = req.user.userId;
    const watchedAt = status === "watched" ? new Date() : null;
    const updatedMovie = await pool.query(
      `
  UPDATE watchlist_items
  SET
    status = $1,
    watched_at = $2
  WHERE user_id = $3
    AND movie_id = $4
  RETURNING id, movie_id, status, added_at, watched_at;
  `,
      [status, watchedAt, userId, movieId],
    );

    if (updatedMovie.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found in watchlist.",
      });
    }

    return res.status(200).json({
      message: "Watchlist status updated",
      watchlistItem: updatedMovie.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const removeMovie = async (req, res, next) => {
  try {
    const result = movieIdParamSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid movie ID.",
      });
    }

    const { movieId } = result.data;
    const userId = req.user.userId;

    const deleteResult = await pool.query(
      `
            delete from watchlist_items where user_id = $1 and movie_id = $2 
            returning id;
            `,
      [userId, movieId],
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found in watchlist.",
      });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
