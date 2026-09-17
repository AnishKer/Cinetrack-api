import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import request from "supertest";

import app from "../src/app.js";
import pool from "../src/config/db.js";

let token;
let userId;
let username;

before(async () => {
  const timestamp = Date.now();

  const uniqueEmail = `reviewtest${timestamp}@example.com`;
  username = `reviewuser${timestamp}`;

  const registerResponse = await request(app).post("/api/auth/register").send({
    username,
    email: uniqueEmail,
    password: "password123",
  });

  assert.strictEqual(registerResponse.status, 201);

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: uniqueEmail,
    password: "password123",
  });

  assert.strictEqual(loginResponse.status, 200);

  token = loginResponse.body.token;
  userId = loginResponse.body.user.id;
});

after(async () => {
  await pool.query(
    `
    DELETE FROM reviews
    WHERE user_id = $1;
    `,
    [userId],
  );

  await pool.query(
    `
    DELETE FROM watchlist_items
    WHERE user_id = $1;
    `,
    [userId],
  );
});

test("POST /api/movies/:movieId/review creates a review", async () => {
  await pool.query(
    `
    INSERT INTO watchlist_items (user_id, movie_id, status)
    VALUES ($1, 1, 'watched');
    `,
    [userId],
  );

  const response = await request(app)
    .post("/api/movies/1/reviews")
    .set("Authorization", `Bearer ${token}`)
    .send({
      rating: 9,
      review_text: "An incredible movie.",
    });

  assert.strictEqual(response.status, 201);

  assert.strictEqual(response.body.review.movie_id, 1);
  assert.strictEqual(response.body.review.rating, 9);
  assert.strictEqual(response.body.review.review_text, "An incredible movie.");
});

test("POST /api/movies/:movieId/review rejects duplicate review", async () => {
  await pool.query(
    `
    INSERT INTO watchlist_items (user_id, movie_id, status)
    VALUES ($1, 3, 'watched');
    `,
    [userId],
  );

  await pool.query(
    `
    INSERT INTO reviews (
      user_id,
      movie_id,
      rating,
      review_text
    )
    VALUES ($1, 3, 8, 'Existing review');
    `,
    [userId],
  );

  const response = await request(app)
    .post("/api/movies/3/reviews")
    .set("Authorization", `Bearer ${token}`)
    .send({
      rating: 9,
      review_text: "Another review.",
    });

  assert.strictEqual(response.status, 409);
});

test("POST /api/movies/:movieId/review rejects unwatched movie", async () => {
  const response = await request(app)
    .post("/api/movies/4/reviews")
    .set("Authorization", `Bearer ${token}`)
    .send({
      rating: 8,
      review_text: "I have not watched this.",
    });

  assert.strictEqual(response.status, 400);
});

test("POST /api/movies/:movieId/review returns 404 for nonexistent movie", async () => {
  const response = await request(app)
    .post("/api/movies/9999/reviews")
    .set("Authorization", `Bearer ${token}`)
    .send({
      rating: 8,
      review_text: "Great movie.",
    });

  assert.strictEqual(response.status, 404);
});

test("POST /api/movies/:movieId/review rejects invalid rating", async () => {
  const response = await request(app)
    .post("/api/movies/1/reviews")
    .set("Authorization", `Bearer ${token}`)
    .send({
      rating: 11,
      review_text: "Great movie.",
    });

  assert.strictEqual(response.status, 400);
});

test("POST /api/movies/:movieId/review rejects empty review text", async () => {
  const response = await request(app)
    .post("/api/movies/1/reviews")
    .set("Authorization", `Bearer ${token}`)
    .send({
      rating: 8,
      review_text: "",
    });

  assert.strictEqual(response.status, 400);
});

test("POST /api/movies/:movieId/review requires authentication", async () => {
  const response = await request(app).post("/api/movies/1/reviews").send({
    rating: 8,
    review_text: "Great movie.",
  });

  assert.strictEqual(response.status, 401);
});

test("GET /api/movies/:movieId/reviews returns reviews", async () => {
  await pool.query(
    `
    INSERT INTO watchlist_items (user_id, movie_id, status)
    VALUES ($1, 5, 'watched');
    `,
    [userId],
  );

  await pool.query(
    `
    INSERT INTO reviews (
      user_id,
      movie_id,
      rating,
      review_text
    )
    VALUES ($1, 5, 9, 'Test review');
    `,
    [userId],
  );

  const response = await request(app).get("/api/movies/5/reviews");

  assert.strictEqual(response.status, 200);
});

test("GET /api/movies/:movieId/reviews includes reviewer username", async () => {
  await pool.query(
    `
    INSERT INTO watchlist_items (user_id, movie_id, status)
    VALUES ($1, 6, 'watched');
    `,
    [userId],
  );

  await pool.query(
    `
    INSERT INTO reviews (
      user_id,
      movie_id,
      rating,
      review_text
    )
    VALUES ($1, 6, 9, 'Username test review');
    `,
    [userId],
  );

  const response = await request(app).get("/api/movies/6/reviews");

  assert.strictEqual(response.status, 200);

  const review = response.body.reviews.find(
    (item) => item.review_text === "Username test review",
  );

  assert.ok(review);
  assert.strictEqual(review.username, username);

  assert.strictEqual("password" in review, false);
  assert.strictEqual("password_hash" in review, false);
});

test("GET /api/movies/:movieId/reviews returns empty array when no reviews exist", async () => {
  const response = await request(app).get("/api/movies/7/reviews");

  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual(response.body.reviews, []);
});

test("GET /api/movies/:movieId/reviews returns 404 for nonexistent movie", async () => {
  const response = await request(app).get("/api/movies/9999/reviews");

  assert.strictEqual(response.status, 404);
});

test("GET /api/movies/:movieId/reviews is publicly accessible", async () => {
  const response = await request(app).get("/api/movies/7/reviews");

  assert.strictEqual(response.status, 200);
});

test("DELETE /api/movies/:movieId/review deletes user's review", async () => {
  await pool.query(
    `
    INSERT INTO watchlist_items (user_id, movie_id, status)
    VALUES ($1, 8, 'watched');
    `,
    [userId],
  );

  await pool.query(
    `
    INSERT INTO reviews (
      user_id,
      movie_id,
      rating,
      review_text
    )
    VALUES ($1, 8, 9, 'Review to delete');
    `,
    [userId],
  );

  const response = await request(app)
    .delete("/api/movies/8/reviews")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(response.status, 204);

  const check = await pool.query(
    `
    SELECT id
    FROM reviews
    WHERE user_id = $1
      AND movie_id = 8;
    `,
    [userId],
  );

  assert.strictEqual(check.rows.length, 0);
});

test("DELETE /api/movies/:movieId/review returns 404 when review does not exist", async () => {
  const response = await request(app)
    .delete("/api/movies/9/reviews")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(response.status, 404);
});

test("DELETE /api/movies/:movieId/review cannot delete another user's review", async () => {
  const timestamp = Date.now();

  const otherUsername = `otheruser${timestamp}`;
  const otherEmail = `otheruser${timestamp}@example.com`;

  const registerResponse = await request(app).post("/api/auth/register").send({
    username: otherUsername,
    email: otherEmail,
    password: "password123",
  });

  assert.strictEqual(registerResponse.status, 201);

  const otherUserId = registerResponse.body.user.id;

  await pool.query(
    `
    INSERT INTO reviews (
      user_id,
      movie_id,
      rating,
      review_text
    )
    VALUES ($1, 10, 8, 'Other user review');
    `,
    [otherUserId],
  );

  const response = await request(app)
    .delete("/api/movies/10/review")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(response.status, 404);

  await pool.query(
    `
    DELETE FROM reviews
    WHERE user_id = $1;
    `,
    [otherUserId],
  );

  await pool.query(
    `
    DELETE FROM users
    WHERE id = $1;
    `,
    [otherUserId],
  );
});
