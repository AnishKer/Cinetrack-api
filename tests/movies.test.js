import test, { before, after } from "node:test";
import assert from "node:assert";
import request from "supertest";

import app from "../src/app.js";
import pool from "../src/config/db.js";

before(async () => {
  await pool.query(`
    INSERT INTO movies (title, release_year, genre, description)
    VALUES ('Test Movie', 2026, 'Drama', 'A test movie')
  `);
});

after(async () => {
  await pool.query(`
    DELETE FROM movies
    WHERE title = 'Test Movie'
  `);
});

test("GET /api/movies/:id - should return a movie", async () => {
  const result = await pool.query(
    `SELECT id FROM movies WHERE title = 'Test Movie'`
  );

  const movieId = result.rows[0].id;

  const response = await request(app)
    .get(`/api/movies/${movieId}`);

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.movie.title, "Test Movie");
  assert.strictEqual(response.body.movie.release_year, 2026);
});

test("GET /api/movies/:id - should return 404 for nonexistent movie", async () => {
  const response = await request(app)
    .get("/api/movies/999999");

  assert.strictEqual(response.statusCode, 404);
  assert.deepStrictEqual(response.body, {
    message: "Movie not found.",
  });
});

test("GET /api/movies - should return all movies", async () => {
  const response = await request(app)
    .get("/api/movies");

  assert.strictEqual(response.statusCode, 200);
  assert.ok(Array.isArray(response.body.movies));
  assert.ok(response.body.movies.length > 0);
});

test("GET /api/movies - should search movies by title", async () => {
  const response = await request(app)
    .get("/api/movies?search=dark");

  assert.strictEqual(response.statusCode, 200);
  assert.ok(
    response.body.movies.some(
      (movie) => movie.title === "The Dark Knight",
    ),
  );
});

test("GET /api/movies - should filter movies by genre", async () => {
  const response = await request(app)
    .get("/api/movies?genre=Sci-Fi");

  assert.strictEqual(response.statusCode, 200);

  assert.ok(
    response.body.movies.every(
      (movie) => movie.genre === "Sci-Fi",
    ),
  );
});

test("GET /api/movies - should filter movies by year", async () => {
  const response = await request(app)
    .get("/api/movies?year=2014");

  assert.strictEqual(response.statusCode, 200);

  assert.ok(
    response.body.movies.every(
      (movie) => movie.release_year === 2014,
    ),
  );
});

test("GET /api/movies - should combine filters", async () => {
  const response = await request(app)
    .get("/api/movies?genre=Sci-Fi&year=2014");

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.movies.length, 1);
  assert.strictEqual(
    response.body.movies[0].title,
    "Interstellar",
  );
});

test("GET /api/movies - should sort movies by release year descending", async () => {
  const response = await request(app)
    .get("/api/movies?sort=year&order=desc");

  assert.strictEqual(response.statusCode, 200);

  const movies = response.body.movies;

  for (let i = 1; i < movies.length; i++) {
    assert.ok(
      movies[i - 1].release_year >= movies[i].release_year,
    );
  }
});

test("GET /api/movies - should reject invalid sort field", async () => {
  const response = await request(app)
    .get("/api/movies?sort=rating");

  assert.strictEqual(response.statusCode, 400);
  assert.strictEqual(
    response.body.message,
    "Validation failed.",
  );
});