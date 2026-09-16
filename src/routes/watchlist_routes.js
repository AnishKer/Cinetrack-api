import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  addMovie,
  getWatchlist,
  updateMovie,
  removeMovie,
} from "../controllers/watchlist_controller.js";
const router = express.Router();

router.post("/:movieId", authenticate, addMovie);
router.get("/", authenticate, getWatchlist);
router.patch("/:movieId", authenticate, updateMovie);
router.delete("/:movieId", authenticate, removeMovie);
export default router;
