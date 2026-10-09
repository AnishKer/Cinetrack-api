import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createReview,
  getReviews,
  deleteReview,
} from "../controllers/review_controller.js";

const router = express.Router();

router.post("/:movieId/reviews", authenticate, createReview);
router.get("/:movieId/reviews", getReviews);
router.delete("/:movieId/reviews", authenticate, deleteReview);

export default router;
