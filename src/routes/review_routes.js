import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createReview } from "../controllers/review_controller.js";

const router = express.Router();

router.post("/:movieId/review", authenticate, createReview);

export default router;
