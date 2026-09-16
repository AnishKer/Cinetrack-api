import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { addMovie , getWatchlist } from "../controllers/watchlist_controller.js";
const router = express.Router();

router.post("/:movieId", authenticate, addMovie);
router.get("/", authenticate, getWatchlist);

export default router;
