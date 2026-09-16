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