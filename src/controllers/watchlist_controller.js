import pool from "../config/db.js";

export const addMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    const result = await pool.query(
      `
          select id from movies where id = $1
          `,
      [movieId],
    );

    if (result.rows.length === 0) {
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
