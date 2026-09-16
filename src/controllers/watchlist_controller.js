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
