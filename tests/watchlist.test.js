import test, { before, after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import bcrypt from "bcrypt";

import app from "../src/app.js";
import pool from "../src/config/db.js";

let token;
let movieId;

before(async () => {
  const passwordHash = await bcrypt.hash("TestPassword123", 12);

  const user = await pool.query(
    `
    INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id;
    `,
    ["watchlist_test_user", "watchlist@test.com", passwordHash],
  );

  const movie = await pool.query(
    `
    INSERT INTO movies (title, release_year, genre, description)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
    `,
    ["Watchlist Test Movie", 2026, "Drama", "Test movie"],
  );

  movieId = movie.rows[0].id;

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "watchlist@test.com",
    password: "TestPassword123",
  });

  token = loginResponse.body.token;
});

test("POST /api/watchlist/:movieId - should add movie to watchlist", async () => {
  const response = await request(app)
    .post(`/api/watchlist/${movieId}`)
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(response.statusCode, 201);
  assert.strictEqual(response.body.message, "Movie added to watchlist.");
});

test("POST /api/watchlist/:movieId - should reject duplicate movie", async () => {
  const response = await request(app)
    .post(`/api/watchlist/${movieId}`)
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(response.statusCode, 409);
  assert.strictEqual(response.body.message, "Movie already in the watchlist.");
});

test("POST /api/watchlist/:movieId - should reject nonexistent movie", async () => {
  const response = await request(app)
    .post("/api/watchlist/999999")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(response.statusCode, 404);
  assert.strictEqual(response.body.message, "Movie not found.");
});

test("POST /api/watchlist/:movieId - should reject unauthenticated request", async () => {
  const response = await request(app).post(`/api/watchlist/${movieId}`);

  assert.strictEqual(response.statusCode, 401);
});

after(async () => {
  await pool.query(`DELETE FROM users WHERE email = $1`, [
    "watchlist@test.com",
  ]);

  await pool.query(`DELETE FROM movies WHERE id = $1`, [movieId]);
});

test("GET /api/watchlist - should return user's watchlist", async () => {
  // Add the movie through the API
  await request(app)
    .post(`/api/watchlist/${movieId}`)
    .set("Authorization", `Bearer ${token}`);

  const response = await request(app)
    .get("/api/watchlist")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.watchlist.length, 1);

  assert.strictEqual(response.body.watchlist[0].movie_id, movieId);

  assert.strictEqual(response.body.watchlist[0].title, "Watchlist Test Movie");

  assert.strictEqual(response.body.watchlist[0].status, "planned");
});

test("GET /api/watchlist - should return empty array for user with no movies", async () => {
  const passwordHash = await bcrypt.hash("TestPassword456", 12);

  await pool.query(
    `
    INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3);
    `,
    ["empty_watchlist_user", "empty@watchlist.com", passwordHash],
  );

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "empty@watchlist.com",
    password: "TestPassword456",
  });

  const emptyUserToken = loginResponse.body.token;

  const response = await request(app)
    .get("/api/watchlist")
    .set("Authorization", `Bearer ${emptyUserToken}`);

  assert.strictEqual(response.statusCode, 200);
  assert.deepStrictEqual(response.body.watchlist, []);

  await pool.query(`DELETE FROM users WHERE email = $1`, [
    "empty@watchlist.com",
  ]);
});

test("GET /api/watchlist - should reject unauthenticated request", async () => {
  const response = await request(app).get("/api/watchlist");

  assert.strictEqual(response.statusCode, 401);
});

test("GET /api/watchlist - should return user's watchlist", async () => {
  const response = await request(app)
    .get("/api/watchlist")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.watchlist.length, 1);

  assert.strictEqual(response.body.watchlist[0].movie_id, movieId);

  assert.strictEqual(response.body.watchlist[0].title, "Watchlist Test Movie");

  assert.strictEqual(response.body.watchlist[0].status, "planned");
});
