import pool from "../config/db.js";
import { createReviewSchema } from "../validators/review_validator.js";

export const createReview = async (req, res, next) => {
  try {
    const result = createReviewSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed.",
      });
    }

    const { rating, review_text } = result.data;
    const { movieId } = req.params;
    const userId = req.user.userId;

    const movieResult = await pool.query(
      `
        select id from movies where id = $1`,
      [movieId],
    );

    if (movieResult.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found.",
      });
    }

    const watchListResult = await pool.query(
      `
        select id from watchlist_items where user_id = $1 and movie_id = $2 and status = 'watched' `,
      [userId, movieId],
    );

    if (watchListResult.rows.length === 0) {
      return res.status(400).json({
        message: "You can only review movies you have watched",
      });
    }

    const reviewResult = await pool.query(
      `
        insert into reviews (user_id,movie_id,rating,review_text) 
        values ($1,$2,$3,$4)
        returning id,movie_id,rating,review_text,created_at,updated_at
        `,
      [userId, movieId, rating, review_text],
    );

    return res.status(201).json({
      message: "Review created.",
      review: reviewResult.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        message: "You have already reviewed this movie.",
      });
    }

    next(err);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    const movieResult = await pool.query(
      `
      select id from movies where id = $1
      `,
      [movieId],
    );

    if (movieResult.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found.",
      });
    }

    const reviewResult = await pool.query(
      `
        select r.id, r.movie_id,r.rating,r.review_text,r.created_at,r.updated_at,u.username from reviews r join users u on r.user_id = u.id 
        where r.movie_id = $1
        order by r.created_at desc;
      `,
      [movieId],
    );

    return res.status(200).json({
      reviews: reviewResult.rows,
    });
  } catch (err) {
    next(err);
  }
};
