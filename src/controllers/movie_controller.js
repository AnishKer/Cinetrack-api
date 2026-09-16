import pool from "../config/db.js";

export const getMovies = async (req, res, next) => {
  try {
    const result = await pool.query(
      `
            select id,title,release_year,genre,description from movies order by id asc;
            `,
    );

    return res.status(200).json({
      movies: result.rows,
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
