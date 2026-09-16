import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  addMovie,
  getWatchlist,
  updateMovie,
} from "../controllers/watchlist_controller.js";
const router = express.Router();

router.post("/:movieId", authenticate, addMovie);
router.get("/", authenticate, getWatchlist);
router.patch("/:movieId", authenticate, updateMovie);

export default router;
