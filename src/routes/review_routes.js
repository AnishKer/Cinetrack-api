import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createReview, getReviews } from "../controllers/review_controller.js";

const router = express.Router();

router.post("/:movieId/reviews", authenticate, createReview);
router.get("/:movieId/reviews", getReviews);

export default router;
