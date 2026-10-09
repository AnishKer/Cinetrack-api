import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth_routes.js";
import movieRoutes from "./routes/movie_routes.js";
import watchlistRoutes from "./routes/watchlist_routes.js";
import reviewRoutes from "./routes/review_routes.js";
import { notFound } from "./middleware/not_found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Movie Watchlist API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/movies", movieRoutes);
app.use("/api/movies", reviewRoutes);

app.use("/api/watchlist", watchlistRoutes);

app.use(notFound);
app.use(errorHandler);
export default app;
