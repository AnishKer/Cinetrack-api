import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import request from "supertest";

import app from "../src/app.js";
import pool from "../src/config/db.js";

let token;
let userId;

before(async () => {
  const uniqueEmail = `reviewtest${Date.now()}@example.com`;

  const registerResponse = await request(app)
    .post("/api/auth/register")
    .send({
      username: `reviewuser${Date.now()}`,
      email: uniqueEmail,
      password: "password123",
    });

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: uniqueEmail,
      password: "password123",
    });

  token = loginResponse.body.token;
  userId = loginResponse.body.user.id;

  // Add movie 1 to the user's watchlist
  await pool.query(
    `
    INSERT INTO watchlist_items (user_id, movie_id, status)
    VALUES ($1, 1, 'watched');
    `,
    [userId],
  );
});

after(async () => {
  await pool.query(
    `DELETE FROM reviews WHERE user_id = $1;`,
    [userId],
  );

  await pool.query(
    `DELETE FROM watchlist_items WHERE user_id = $1;`,
    [userId],
  );
});

test("POST /api/movies/:movieId/review creates a review", async () => {
  const response = await request(app)
    .post("/api/movies/1/review")
    .set("Authorization", `Bearer ${token}`)
    .send({
      rating: 9,
      review_text: "An incredible movie.",
    });

  assert.strictEqual(response.status, 201);
  assert.strictEqual(response.body.review.movie_id, 1);
  assert.strictEqual(response.body.review.rating, 9);
  assert.strictEqual(
    response.body.review.review_text,
    "An incredible movie.",
  );
});

test("POST /api/movies/:movieId/review rejects duplicate review", async () => {
  const response = await request(app)
    .post("/api/movies/1/review")
    .set("Authorization", `Bearer ${token}`)
    .send({
      rating: 8,
      review_text: "Another review.",
    });

  assert.strictEqual(response.status, 409);
});

test("POST /api/movies/:movieId/review rejects unwatched movie", async () => {
  const response = await request(app)
    .post("/api/movies/2/review")
    .set("Authorization", `Bearer ${token}`)
    .send({
      rating: 8,
      review_text: "I have not watched this.",
    });

  assert.strictEqual(response.status, 400);
});

test("POST /api/movies/:movieId/review returns 404 for nonexistent movie", async () => {
  const response = await request(app)
    .post("/api/movies/9999/review")
    .set("Authorization", `Bearer ${token}`)
    .send({
      rating: 8,
      review_text: "Great movie.",
    });

  assert.strictEqual(response.status, 404);
});

test("POST /api/movies/:movieId/review rejects invalid rating", async () => {
  const response = await request(app)
    .post("/api/movies/1/review")
    .set("Authorization", `Bearer ${token}`)
    .send({
      rating: 11,
      review_text: "Great movie.",
    });

  assert.strictEqual(response.status, 400);
});

test("POST /api/movies/:movieId/review rejects empty review text", async () => {
  const response = await request(app)
    .post("/api/movies/1/review")
    .set("Authorization", `Bearer ${token}`)
    .send({
      rating: 8,
      review_text: "",
    });

  assert.strictEqual(response.status, 400);
});

test("POST /api/movies/:movieId/review requires authentication", async () => {
  const response = await request(app)
    .post("/api/movies/1/review")
    .send({
      rating: 8,
      review_text: "Great movie.",
    });

  assert.strictEqual(response.status, 401);
});