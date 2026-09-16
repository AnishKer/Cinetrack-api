import express from "express";
import authRoutes from "./routes/auth_routes.js";
import movieRoutes from "./routes/movie_routes.js";
import watchlistRoutes from "./routes/watchlist_routes.js";
import { authenticate } from "./middleware/auth.middleware.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Movie Watchlist API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/movies", movieRoutes);

app.use("/api/watchlist", watchlistRoutes);
export default app;
