import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "../src/app.js";
import pool from "../src/config/db.js";

before(async () => {
  await pool.query("DELETE FROM users");
});

after(async () => {
  await pool.query("DELETE FROM users");
});

test("POST /api/auth/register - should register a new user", async () => {
  const response = await request(app).post("/api/auth/register").send({
    username: "testuser",
    email: "testuser@example.com",
    password: "password123",
  });

  assert.strictEqual(response.statusCode, 201);

  assert.strictEqual(response.body.message, "User registered successfully.");

  assert.strictEqual(response.body.user.username, "testuser");
  assert.strictEqual(response.body.user.email, "testuser@example.com");

  assert.ok(response.body.user.id);
  assert.ok(response.body.user.created_at);

  // Password hash must never be returned
  assert.strictEqual(response.body.user.password_hash, undefined);
});

test("POST /api/auth/register - should reject duplicate username/email", async () => {
  const response = await request(app).post("/api/auth/register").send({
    username: "testuser",
    email: "testuser@example.com",
    password: "password123",
  });

  assert.strictEqual(response.statusCode, 409);

  assert.strictEqual(
    response.body.message,
    "Username or email already exists.",
  );
});

test("POST /api/auth/register - should reject invalid input", async () => {
  const response = await request(app).post("/api/auth/register").send({
    username: "ab",
    email: "invalid-email",
    password: "123",
  });

  assert.strictEqual(response.statusCode, 400);

  assert.strictEqual(response.body.message, "Validation failed.");
});

test("POST /api/auth/register - should store a hashed password", async () => {
  const response = await request(app).post("/api/auth/register").send({
    username: "hashuser",
    email: "hashuser@example.com",
    password: "password123",
  });

  assert.strictEqual(response.statusCode, 201);

  const result = await pool.query(
    `
    SELECT password_hash
    FROM users
    WHERE email = $1
    `,
    ["hashuser@example.com"],
  );

  assert.strictEqual(result.rows.length, 1);

  const passwordHash = result.rows[0].password_hash;

  assert.ok(passwordHash.startsWith("$2"));

  assert.notStrictEqual(passwordHash, "password123");
});

test("POST /api/auth/login - should login with valid credentials", async () => {
  const response = await request(app).post("/api/auth/login").send({
    email: "testuser@example.com",
    password: "password123",
  });

  assert.strictEqual(response.statusCode, 200);

  assert.strictEqual(response.body.message, "Login successful.");

  assert.ok(response.body.token);

  assert.strictEqual(response.body.user.username, "testuser");
  assert.strictEqual(response.body.user.email, "testuser@example.com");

  assert.strictEqual(response.body.user.password_hash, undefined);
});

test("POST /api/auth/login - should reject wrong password", async () => {
  const response = await request(app).post("/api/auth/login").send({
    email: "testuser@example.com",
    password: "wrongpassword",
  });

  assert.strictEqual(response.statusCode, 401);

  assert.strictEqual(response.body.message, "Invalid email or password");
});

test("POST /api/auth/login - should reject non-existent email", async () => {
  const response = await request(app).post("/api/auth/login").send({
    email: "doesnotexist@example.com",
    password: "password123",
  });

  assert.strictEqual(response.statusCode, 401);

  assert.strictEqual(response.body.message, "Invalid email or password");
});

test("POST /api/auth/login - should reject invalid input", async () => {
  const response = await request(app).post("/api/auth/login").send({
    email: "not-an-email",
    password: "",
  });

  assert.strictEqual(response.statusCode, 400);

  assert.strictEqual(response.body.message, "Validation failed.");
});

test("GET /api/auth/me - should return authenticated user", async () => {
  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "testuser@example.com",
    password: "password123",
  });

  const token = loginResponse.body.token;

  const response = await request(app)
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(response.statusCode, 200);

  assert.strictEqual(response.body.user.username, "testuser");
  assert.strictEqual(response.body.user.email, "testuser@example.com");

  assert.ok(response.body.user.id);
  assert.ok(response.body.user.created_at);

  assert.strictEqual(response.body.user.password_hash, undefined);
});

test("GET /api/auth/me - should reject request without token", async () => {
  const response = await request(app).get("/api/auth/me");

  assert.strictEqual(response.statusCode, 401);

  assert.strictEqual(response.body.message, "Authentication required.");
});

test("GET /api/auth/me - should reject invalid token", async () => {
  const response = await request(app)
    .get("/api/auth/me")
    .set("Authorization", "Bearer invalid-token");

  assert.strictEqual(response.statusCode, 401);

  assert.strictEqual(response.body.message, "Invalid or expired token.");
});

test("GET /api/auth/me - should return 404 if user no longer exists", async () => {
  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "testuser@example.com",
    password: "password123",
  });

  const token = loginResponse.body.token;

  await pool.query("DELETE FROM users WHERE email = $1", [
    "testuser@example.com",
  ]);

  const response = await request(app)
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(response.statusCode, 404);

  assert.strictEqual(response.body.message, "User not found.");
});
