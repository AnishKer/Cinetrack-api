This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: .env, .env.*, node_modules/**, .git/**, coverage/**, *.log, *.lock
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
src/
  config/
    db.js
    schema.sql
    seed.js
  controllers/
    auth_controller.js
    movie_controller.js
    review_controller.js
    watchlist_controller.js
  middleware/
    auth.middleware.js
    error.middleware.js
    not_found.middleware.js
  routes/
    auth_routes.js
    movie_routes.js
    review_routes.js
    watchlist_routes.js
  validators/
    auth_validator.js
    movie_validator.js
    param_validator.js
    review_validator.js
    watchlist_validator.js
  app.js
  server.js
tests/
  auth.test.js
  movies.test.js
  review.test.js
  watchlist.test.js
.gitignore
package.json
README.md
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="src/config/db.js">
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});



export default pool;
</file>

<file path="src/controllers/auth_controller.js">
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { registerSchema, loginSchema } from "../validators/auth_validator.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed.",
      });
    }

    const { username, email, password } = result.data;

    const existingUser = await pool.query(
      `
            select id from users where username = $1 or email = $2;
            `,
      [username, email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Username or email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await pool.query(
      `
        insert into users (username ,email , password_hash) values ($1,$2,$3) returning id,username,email,created_at;
        `,
      [username, email, passwordHash],
    );

    return res.status(201).json({
      message: "User registered successfully.",
      user: newUser.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed.",
      });
    }

    const { email, password } = result.data;

    const user = await pool.query(
      `
  SELECT id, username, email, password_hash
  FROM users
  WHERE email = $1
  `,
      [email],
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const existingUser = user.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      existingUser.password_hash,
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await pool.query(
      `
        select id,username,email,created_at from users where id = $1
      `,
      [req.user.userId],
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      user: user.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
</file>

<file path="src/middleware/auth.middleware.js">
import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};
</file>

<file path="src/middleware/error.middleware.js">
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  return res.status(500).json({
    message: "Internal Server Error.",
  });
};
</file>

<file path="src/middleware/not_found.middleware.js">
export const notFound = (req, res) => {
  return res.status(404).json({
    message: "Route not found.",
  });
};
</file>

<file path="src/routes/auth_routes.js">
import express from "express";
import { register, login, getMe } from "../controllers/auth_controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

export default router;
</file>

<file path="src/routes/movie_routes.js">
import express from "express";
import { getMovies , getMovieById } from "../controllers/movie_controller.js";

const router = express.Router();

router.get("/", getMovies);
router.get("/:id", getMovieById);

export default router;
</file>

<file path="src/validators/auth_validator.js">
import {z} from "zod"

export const registerSchema = z.object({
    username: z.string().trim().min(3,"Username must be at least 3 characters.").max(50,"Username must not exceed 50 characters."),

    email:z.string().trim().email("Invalid email address."),

    password: z.string().min(8,"Password must be at least 8 characters.").max(100,"Password must not exceed 100 characters")
})

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});
</file>

<file path="src/validators/param_validator.js">
import { z } from "zod";

export const movieIdParamSchema = z.object({
  movieId: z.coerce.number().int().positive(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
</file>

<file path="src/validators/review_validator.js">
import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(10),
  review_text: z.string().trim().min(1).max(2000),
});
</file>

<file path="src/validators/watchlist_validator.js">
import {z} from "zod";

export const updateWatchlistSchema = z.object ({
    status: z.enum(["planned","watched"])
})
</file>

<file path=".gitignore">
node_modules/
.env
.env.test
coverage/
*.log
.DS_Store
</file>

<file path="src/config/seed.js">
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const movies = [
  {
    title: "Interstellar",
    releaseYear: 2014,
    genre: "Sci-Fi",
    description:
      "A team of explorers travels through a wormhole in search of a new home for humanity.",
  },
  {
    title: "Inception",
    releaseYear: 2010,
    genre: "Sci-Fi",
    description:
      "A skilled extractor enters people's dreams to steal and plant information.",
  },
  {
    title: "The Dark Knight",
    releaseYear: 2008,
    genre: "Action",
    description:
      "Batman faces a criminal mastermind who pushes Gotham into chaos.",
  },
  {
    title: "The Shawshank Redemption",
    releaseYear: 1994,
    genre: "Drama",
    description:
      "A banker forms an unlikely friendship while serving a life sentence in prison.",
  },
  {
    title: "The Godfather",
    releaseYear: 1972,
    genre: "Crime",
    description:
      "The aging patriarch of a crime family transfers control of his empire to his son.",
  },
  {
    title: "Pulp Fiction",
    releaseYear: 1994,
    genre: "Crime",
    description:
      "Several interconnected stories unfold around criminals in Los Angeles.",
  },
  {
    title: "The Matrix",
    releaseYear: 1999,
    genre: "Sci-Fi",
    description:
      "A hacker discovers that reality is not what it appears to be.",
  },
  {
    title: "Parasite",
    releaseYear: 2019,
    genre: "Thriller",
    description:
      "A struggling family gradually becomes involved with a wealthy household.",
  },
  {
    title: "Whiplash",
    releaseYear: 2014,
    genre: "Drama",
    description:
      "A young drummer faces an intense instructor determined to push him to greatness.",
  },
  {
    title: "Avengers: Endgame",
    releaseYear: 2019,
    genre: "Action",
    description:
      "The Avengers attempt to reverse the devastating events that changed their universe.",
  },
  {
    title: "Dune",
    releaseYear: 2021,
    genre: "Sci-Fi",
    description:
      "A young noble becomes involved in a struggle over a valuable desert planet.",
  },
  {
    title: "Get Out",
    releaseYear: 2017,
    genre: "Horror",
    description:
      "A young man discovers disturbing secrets during a visit to his girlfriend's family.",
  },
  {
    title: "La La Land",
    releaseYear: 2016,
    genre: "Romance",
    description:
      "An aspiring actress and a jazz musician pursue their dreams while falling in love.",
  },
  {
    title: "The Social Network",
    releaseYear: 2010,
    genre: "Drama",
    description:
      "The story of the creation and early growth of a major social networking platform.",
  },
  {
    title: "Mad Max: Fury Road",
    releaseYear: 2015,
    genre: "Action",
    description:
      "A group of survivors attempts to escape across a dangerous post-apocalyptic wasteland.",
  },
];

const seedMovies = async () => {
  try {
    let insertedCount = 0;

    for (const movie of movies) {
      const result = await pool.query(
        `
          INSERT INTO movies (title, release_year, genre, description)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (title, release_year) DO NOTHING
        `,
        [movie.title, movie.releaseYear, movie.genre, movie.description],
      );

      insertedCount += result.rowCount;
    }

    console.log(
      `${insertedCount} new movies inserted. ${movies.length - insertedCount} already existed.`,
    );
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await pool.end();
  }
};

seedMovies();
</file>

<file path="src/validators/movie_validator.js">
import { z } from "zod";

export const movieQuerySchema = z.object({
  search: z.string().trim().optional(),
  genre: z.string().trim().optional(),
  year: z.coerce.number().int().positive().optional(),
  sort: z.enum(["title", "year"]).default("title"),
  order: z.enum(["asc", "desc"]).default("asc"),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});
</file>

<file path="src/server.js">
import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected successfully.");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        console.log("HTTP server closed.");

        try {
          await pool.end();
          console.log("Database pool closed.");
          process.exit(0);
        } catch (err) {
          console.error("Error closing database pool:", err);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
};

startServer();
</file>

<file path="tests/auth.test.js">
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
</file>

<file path="README.md">
# CineTrack — Movie Watchlist & Review API

A backend REST API for managing personal movie watchlists, tracking watched movies, and writing reviews. The project uses PostgreSQL as the source of truth and focuses on authentication, authorization, relational database design, validation, pagination, and automated API testing.

## Features

- User registration and login with JWT authentication
- Password hashing with bcrypt
- Protected authenticated routes
- Personal watchlists with `planned` and `watched` states
- Watched timestamp tracking
- Movie catalog retrieval by ID
- Movie search, genre/year filtering, sorting, and offset pagination
- Movie reviews with ratings from 1–10
- Users can review only movies they have marked as watched
- One watchlist entry per user/movie
- One review per user/movie
- Review ownership protection
- Zod validation for request bodies, query parameters, and movie IDs
- PostgreSQL indexes for frequently used queries
- Centralized error handling and 404 handling
- Malformed JSON handling
- Helmet security headers
- Morgan HTTP request logging
- Graceful server/database shutdown
- Idempotent movie seeding
- Automated API tests with Node's built-in test runner and Supertest

## Tech Stack

| Category              | Technology                      |
| --------------------- | ------------------------------- |
| Runtime               | Node.js                         |
| Framework             | Express.js                      |
| Database              | PostgreSQL                      |
| Database Driver       | `pg`                            |
| Authentication        | JWT                             |
| Password Hashing      | bcrypt                          |
| Validation            | Zod                             |
| Security              | Helmet                          |
| HTTP Logging          | Morgan                          |
| Testing               | Node.js Test Runner + Supertest |
| Development           | nodemon                         |
| Environment Variables | dotenv                          |
| API Testing           | Postman                         |
| Version Control       | Git + GitHub                    |

## Architecture

The API follows a simple layered Express structure:

```text
Client
  │
  ▼
Express Application
  │
  ├── Routes
  │     └── Controllers
  │           └── PostgreSQL
  │
  ├── Authentication Middleware
  ├── Zod Validators
  ├── 404 Middleware
  └── Global Error Handler
```

PostgreSQL acts as the source of truth for users, movies, watchlist entries, and reviews.

## Database Schema

The project uses four main tables.

### `users`

Stores authenticated users.

```text
id
username
email
password_hash
created_at
```

`username` and `email` are unique.

### `movies`

Stores the global movie catalog.

```text
id
title
release_year
genre
description
created_at
```

`title + release_year` is unique.

### `watchlist_items`

Connects users with movies.

```text
id
user_id
movie_id
status
added_at
watched_at
```

A user can have a movie only once in their watchlist.

Allowed statuses:

```text
planned
watched
```

### `reviews`

Stores movie reviews.

```text
id
user_id
movie_id
rating
review_text
created_at
updated_at
```

Ratings must be between 1 and 10.

A user can review a particular movie only once.

## Authentication

Authentication uses JWT.

### Registration

```text
POST /api/auth/register
```

Example:

```json
{
  "username": "anish",
  "email": "anish@example.com",
  "password": "password123"
}
```

### Login

```text
POST /api/auth/login
```

Example:

```json
{
  "email": "anish@example.com",
  "password": "password123"
}
```

The login response provides a JWT.

Send the token on protected endpoints using:

```text
Authorization: Bearer <token>
```

### Current User

```text
GET /api/auth/me
```

Requires authentication.

## API Endpoints

### Health

| Method | Endpoint  | Auth |
| ------ | --------- | ---- |
| GET    | `/health` | No   |

### Authentication

| Method | Endpoint             | Auth |
| ------ | -------------------- | ---- |
| POST   | `/api/auth/register` | No   |
| POST   | `/api/auth/login`    | No   |
| GET    | `/api/auth/me`       | Yes  |

### Movies

| Method | Endpoint          | Auth |
| ------ | ----------------- | ---- |
| GET    | `/api/movies`     | No   |
| GET    | `/api/movies/:id` | No   |

### Watchlist

| Method | Endpoint                  | Auth |
| ------ | ------------------------- | ---- |
| POST   | `/api/watchlist/:movieId` | Yes  |
| GET    | `/api/watchlist`          | Yes  |
| PATCH  | `/api/watchlist/:movieId` | Yes  |
| DELETE | `/api/watchlist/:movieId` | Yes  |

### Reviews

| Method | Endpoint                       | Auth |
| ------ | ------------------------------ | ---- |
| POST   | `/api/movies/:movieId/review`  | Yes  |
| GET    | `/api/movies/:movieId/reviews` | No   |
| DELETE | `/api/movies/:movieId/review`  | Yes  |

> There is intentionally no review `PATCH` endpoint. Reviews can be created and deleted.

## Movie Search, Filtering, Sorting & Pagination

The movie listing endpoint supports query parameters.

### Search

```text
GET /api/movies?search=interstellar
```

Search is case-insensitive.

### Genre

```text
GET /api/movies?genre=Sci-Fi
```

### Year

```text
GET /api/movies?year=2014
```

### Sorting

Sort by title:

```text
GET /api/movies?sort=title&order=asc
```

Sort by release year:

```text
GET /api/movies?sort=year&order=desc
```

Supported values:

```text
sort:  title | year
order: asc   | desc
```

### Pagination

The API uses limit/offset pagination:

```text
GET /api/movies?limit=5&offset=10
```

`limit` is restricted to 1–100.

Example response structure:

```json
{
  "movies": [],
  "pagination": {
    "limit": 5,
    "offset": 10,
    "total": 15
  }
}
```

Filters, sorting, and pagination can be combined:

```text
GET /api/movies?genre=Sci-Fi&year=2014&sort=title&order=asc&limit=5&offset=0
```

## Watchlist Workflow

Add a movie:

```text
POST /api/watchlist/1
```

Mark it as watched:

```text
PATCH /api/watchlist/1
```

```json
{
  "status": "watched"
}
```

Retrieve the user's watchlist:

```text
GET /api/watchlist
```

Remove a movie:

```text
DELETE /api/watchlist/1
```

A review can only be created after the movie has been marked as `watched`.

## Review Workflow

Create a review:

```text
POST /api/movies/1/review
```

```json
{
  "rating": 9,
  "review_text": "Amazing movie."
}
```

Retrieve reviews:

```text
GET /api/movies/1/reviews
```

Delete the authenticated user's review:

```text
DELETE /api/movies/1/review
```

## Validation & Error Handling

Zod validates:

- Authentication request bodies
- Watchlist status
- Review rating and text
- Movie query parameters
- Movie route IDs

Invalid movie IDs such as:

```text
abc
0
-1
1.5
```

are rejected with `400 Bad Request`.

The API also provides:

- `400` for invalid client input
- `401` for missing/invalid authentication
- `404` for missing resources/routes
- `409` for duplicate resources
- `500` for unexpected server errors

Malformed JSON requests return:

```json
{
  "message": "Invalid JSON."
}
```

## Database Indexing

Indexes were added based on actual API query patterns:

```text
watchlist_items(user_id, added_at DESC)
reviews(movie_id, created_at DESC)
movies(genre)
```

The query plans were checked using PostgreSQL `EXPLAIN ANALYZE`.

The project also uses database-level unique constraints to enforce data integrity.

## Testing

Automated tests use Node.js's built-in test runner and Supertest.

Run the complete test suite:

```bash
npm test
```

The project uses a separate test database through `.env.test`.

For the test movie data:

```bash
npm run seed:test
```

## Postman Testing

The API was manually tested using Postman, including:

- Authentication flows
- Movie retrieval
- Search/filter/sort
- Pagination
- Watchlist CRUD
- Review creation/retrieval/deletion
- Authentication failures
- Authorization/ownership checks
- Invalid request data
- Invalid movie IDs
- Duplicate resources
- Missing resources

## Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <your-repository-directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create PostgreSQL database

Create a PostgreSQL database for the application.

Example:

```text
movie_watchlist
```

### 4. Configure environment variables

Create a `.env` file:

```env
PORT=5000

DATABASE_URL=postgresql://username:password@localhost:5432/movie_watchlist

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

Use a strong secret for `JWT_SECRET`.

Do not commit `.env` to Git.

### 5. Create the database schema

Run the SQL in:

```text
src/config/schema.sql
```

against your PostgreSQL database.

### 6. Seed movies

```bash
npm run seed
```

The seed script is idempotent, so running it again does not create duplicate movies.

### 7. Start the server

Development:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The API will run on:

```text
http://localhost:5000
```

### 8. Run tests

Configure `.env.test` for the separate test database, then:

```bash
npm test
```

## Project Structure

```text
src/
├── config/
│   ├── db.js
│   ├── schema.sql
│   └── seed.js
│
├── controllers/
│   ├── auth_controller.js
│   ├── movie_controller.js
│   ├── review_controller.js
│   └── watchlist_controller.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── not_found.middleware.js
│
├── routes/
│   ├── auth_routes.js
│   ├── movie_routes.js
│   ├── review_routes.js
│   └── watchlist_routes.js
│
├── validators/
│   ├── auth_validator.js
│   ├── movie_validator.js
│   ├── param_validator.js
│   ├── review_validator.js
│   └── watchlist_validator.js
│
├── app.js
└── server.js

tests/
├── auth.test.js
├── movies.test.js
├── watchlist.test.js
└── review.test.js
```

## Design Decisions

### PostgreSQL instead of MongoDB

The application has relational entities and ownership relationships between users, movies, watchlist items, and reviews. PostgreSQL provides foreign keys, unique constraints, checks, and transactional relational data management.

### Limit/Offset Pagination

The movie catalog uses limit/offset pagination intentionally. It is simple and appropriate for catalog browsing, while providing practical experience with pagination queries.

### Global Movie Catalog

Movies belong to a shared catalog rather than individual users. Users reference existing movies through their watchlist entries and reviews.

### Database-Enforced Integrity

Important business constraints are enforced at the database level in addition to API validation:

- Unique username
- Unique email
- Unique user/movie watchlist entry
- Unique user/movie review
- Valid watchlist status
- Rating between 1 and 10
- Unique movie title/release-year combination

## Future Improvements

Potential extensions for a production-scale system could include:

- More advanced search
- Cursor pagination for very large datasets
- Caching
- Rate limiting
- Containerization
- Observability and metrics
- Larger movie catalog management

These are intentionally outside the current project scope.

## License

This project is intended as a backend engineering project for learning, practice, and portfolio purposes.
</file>

<file path="src/config/schema.sql">
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  release_year INTEGER NOT NULL,
  genre VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_movie_title_year
    UNIQUE (title, release_year)
);

CREATE TABLE watchlist_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'planned',
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    watched_at TIMESTAMP,

    CONSTRAINT watchlist_status_check
        CHECK (status IN ('planned', 'watched')),

    CONSTRAINT unique_user_movie
        UNIQUE (user_id, movie_id)
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    review_text TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT review_rating_check
        CHECK (rating BETWEEN 1 AND 10),

    CONSTRAINT unique_user_movie_review
        UNIQUE (user_id, movie_id)
);

CREATE INDEX idx_watchlist_user_added
ON watchlist_items (user_id, added_at DESC);

CREATE INDEX idx_reviews_movie_created
ON reviews (movie_id, created_at DESC);

CREATE INDEX idx_movies_genre
ON movies (genre);
</file>

<file path="src/routes/review_routes.js">
import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createReview,
  getReviews,
  deleteReview,
} from "../controllers/review_controller.js";

const router = express.Router();

router.post("/:movieId/reviews", authenticate, createReview);
router.get("/:movieId/reviews", getReviews);
router.delete("/:movieId/reviews", authenticate, deleteReview);

export default router;
</file>

<file path="tests/review.test.js">
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
</file>

<file path="package.json">
{
  "name": "movie-watchlist-api",
  "version": "1.0.0",
  "description": "A RESTful movie watchlist API built with Node.js, Express and PostgreSQL.",
  "main": "index.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "node --env-file=.env.test --test --test-concurrency=1",
    "seed": "node src/config/seed.js",
    "seed:test": "node --env-file=.env.test src/config/seed.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "bcrypt": "^6.0.0",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "helmet": "^8.3.0",
    "jsonwebtoken": "^9.0.3",
    "morgan": "^1.12.1",
    "pg": "^8.23.0",
    "zod": "^4.6.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.14",
    "supertest": "^7.2.2"
  }
}
</file>

<file path="src/controllers/movie_controller.js">
import pool from "../config/db.js";
import { movieQuerySchema } from "../validators/movie_validator.js";
import { idParamSchema } from "../validators/param_validator.js";

export const getMovies = async (req, res, next) => {
  try {
    const result = movieQuerySchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed.",
      });
    }

    const { search, genre, year, sort, order, limit, offset } = result.data;

    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`title ILIKE $${values.length}`);
    }

    if (genre) {
      values.push(genre);
      conditions.push(`genre = $${values.length}`);
    }

    if (year) {
      values.push(year);
      conditions.push(`release_year = $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sortFields = {
      title: "title",
      year: "release_year",
    };

    const sortField = sortFields[sort];

    const limitParam = values.length + 1;
    const offsetParam = values.length + 2;

    values.push(limit, offset);

    const query = `
      SELECT id, title, release_year, genre, description
      FROM movies
      ${whereClause}
      ORDER BY ${sortField} ${order}
      LIMIT $${limitParam}
      OFFSET $${offsetParam};
    `;

    const movies = await pool.query(query, values);

    const countResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM movies
      ${whereClause};
      `,
      values.slice(0, -2),
    );

    return res.status(200).json({
      movies: movies.rows,
      pagination: {
        limit,
        offset,
        total: Number(countResult.rows[0].total),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const result = idParamSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid movie ID.",
      });
    }

    const { id } = result.data;

    const movieResult = await pool.query(
      `
      SELECT id, title, release_year, genre, description
      FROM movies
      WHERE id = $1;
      `,
      [id],
    );

    if (movieResult.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found.",
      });
    }

    return res.status(200).json({
      movie: movieResult.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
</file>

<file path="src/controllers/review_controller.js">
import pool from "../config/db.js";
import { createReviewSchema } from "../validators/review_validator.js";
import { movieIdParamSchema } from "../validators/param_validator.js";

export const createReview = async (req, res, next) => {
  try {
    const result = createReviewSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed.",
      });
    }

    const { rating, review_text } = result.data;

    const paramResult = movieIdParamSchema.safeParse(req.params);

    if (!paramResult.success) {
      return res.status(400).json({
        message: "Invalid movie ID.",
      });
    }

    const { movieId } = paramResult.data;
    const userId = req.user.userId;

    const movieResult = await pool.query(
      `
        select id from movies where id = $1`,
      [movieId],
    );

    if (movieResult.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found.",
      });
    }

    const watchListResult = await pool.query(
      `
        select id from watchlist_items where user_id = $1 and movie_id = $2 and status = 'watched' `,
      [userId, movieId],
    );

    if (watchListResult.rows.length === 0) {
      return res.status(400).json({
        message: "You can only review movies you have watched",
      });
    }

    const reviewResult = await pool.query(
      `
        insert into reviews (user_id,movie_id,rating,review_text) 
        values ($1,$2,$3,$4)
        returning id,movie_id,rating,review_text,created_at,updated_at
        `,
      [userId, movieId, rating, review_text],
    );

    return res.status(201).json({
      message: "Review created.",
      review: reviewResult.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        message: "You have already reviewed this movie.",
      });
    }

    next(err);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const paramResult = movieIdParamSchema.safeParse(req.params);

    if (!paramResult.success) {
      return res.status(400).json({
        message: "Invalid movie ID.",
      });
    }

    const { movieId } = paramResult.data;

    const movieResult = await pool.query(
      `
      select id from movies where id = $1
      `,
      [movieId],
    );

    if (movieResult.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found.",
      });
    }

    const reviewResult = await pool.query(
      `
        select r.id, r.movie_id,r.rating,r.review_text,r.created_at,r.updated_at,u.username from reviews r join users u on r.user_id = u.id 
        where r.movie_id = $1
        order by r.created_at desc;
      `,
      [movieId],
    );

    return res.status(200).json({
      reviews: reviewResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const paramResult = movieIdParamSchema.safeParse(req.params);

    if (!paramResult.success) {
      return res.status(400).json({
        message: "Invalid movie ID.",
      });
    }

    const { movieId } = paramResult.data;
    const userId = req.user.userId;

    const result = await pool.query(
      `
        delete from reviews where user_id = $1 and movie_id = $2 returning id;
      `,
      [userId, movieId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
</file>

<file path="src/routes/watchlist_routes.js">
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
</file>

<file path="tests/movies.test.js">
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

test("GET /api/movies returns first page with default pagination", async () => {
  const response = await request(app)
    .get("/api/movies");

  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.movies.length, 10);

  assert.strictEqual(response.body.pagination.limit, 10);
  assert.strictEqual(response.body.pagination.offset, 0);
  assert.strictEqual(response.body.pagination.total, 16);
});

test("GET /api/movies respects custom limit", async () => {
  const response = await request(app)
    .get("/api/movies?limit=5");

  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.movies.length, 5);

  assert.strictEqual(response.body.pagination.limit, 5);
  assert.strictEqual(response.body.pagination.offset, 0);
  assert.strictEqual(response.body.pagination.total, 16);
});

test("GET /api/movies respects offset", async () => {
  const firstPage = await request(app)
    .get("/api/movies?limit=5&offset=0");

  const secondPage = await request(app)
    .get("/api/movies?limit=5&offset=5");

  assert.strictEqual(firstPage.status, 200);
  assert.strictEqual(secondPage.status, 200);

  assert.strictEqual(firstPage.body.movies.length, 5);
  assert.strictEqual(secondPage.body.movies.length, 5);

  assert.strictEqual(secondPage.body.pagination.limit, 5);
  assert.strictEqual(secondPage.body.pagination.offset, 5);
  assert.strictEqual(secondPage.body.pagination.total, 16);

  assert.notStrictEqual(
    firstPage.body.movies[0].id,
    secondPage.body.movies[0].id,
  );
});

test("GET /api/movies returns empty page when offset exceeds total", async () => {
  const response = await request(app)
    .get("/api/movies?limit=5&offset=16");

  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.movies.length, 0);

  assert.strictEqual(response.body.pagination.limit, 5);
  assert.strictEqual(response.body.pagination.offset, 16);
  assert.strictEqual(response.body.pagination.total, 16);
});

test("GET /api/movies applies pagination to filtered results", async () => {
  const response = await request(app)
    .get("/api/movies?genre=Sci-Fi&limit=2&offset=0");

  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.movies.length, 2);

  assert.strictEqual(response.body.pagination.limit, 2);
  assert.strictEqual(response.body.pagination.offset, 0);

  assert.strictEqual(response.body.pagination.total, 4);
});

test("GET /api/movies rejects invalid limit", async () => {
  const response = await request(app)
    .get("/api/movies?limit=0");

  assert.strictEqual(response.status, 400);
});

test("GET /api/movies rejects negative offset", async () => {
  const response = await request(app)
    .get("/api/movies?offset=-1");

  assert.strictEqual(response.status, 400);
});

test("GET /api/movies rejects limit above maximum", async () => {
  const response = await request(app)
    .get("/api/movies?limit=101");

  assert.strictEqual(response.status, 400);
});

test("GET /api/movies supports pagination with sorting", async () => {
  const response = await request(app)
    .get("/api/movies?sort=year&order=desc&limit=5&offset=0");

  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.movies.length, 5);

  const years = response.body.movies.map(
    (movie) => movie.release_year,
  );

  for (let i = 1; i < years.length; i++) {
    assert.ok(years[i - 1] >= years[i]);
  }
});
</file>

<file path="tests/watchlist.test.js">
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

test("PATCH /api/watchlist/:movieId - should mark movie as watched", async () => {
  const response = await request(app)
    .patch(`/api/watchlist/${movieId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      status: "watched",
    });

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.watchlistItem.status, "watched");
  assert.ok(response.body.watchlistItem.watched_at);
});

test("PATCH /api/watchlist/:movieId - should mark movie as planned", async () => {
  const response = await request(app)
    .patch(`/api/watchlist/${movieId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      status: "planned",
    });

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.watchlistItem.status, "planned");
  assert.strictEqual(response.body.watchlistItem.watched_at, null);
});

test("PATCH /api/watchlist/:movieId - should reject invalid status", async () => {
  const response = await request(app)
    .patch(`/api/watchlist/${movieId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      status: "completed",
    });

  assert.strictEqual(response.statusCode, 400);
  assert.strictEqual(response.body.message, "Validation failed.");
});

test("PATCH /api/watchlist/:movieId - should reject movie not in watchlist", async () => {
  const response = await request(app)
    .patch("/api/watchlist/999999")
    .set("Authorization", `Bearer ${token}`)
    .send({
      status: "watched",
    });

  assert.strictEqual(response.statusCode, 404);
  assert.strictEqual(response.body.message, "Movie not found in watchlist.");
});

test("PATCH /api/watchlist/:movieId - should reject unauthenticated request", async () => {
  const response = await request(app).patch(`/api/watchlist/${movieId}`).send({
    status: "watched",
  });

  assert.strictEqual(response.statusCode, 401);
});

test("DELETE /api/watchlist/:movieId - should remove movie from watchlist", async () => {
  // Make sure the movie exists in the watchlist first
  await request(app)
    .post(`/api/watchlist/${movieId}`)
    .set("Authorization", `Bearer ${token}`);

  const response = await request(app)
    .delete(`/api/watchlist/${movieId}`)
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(response.statusCode, 204);
});

test("DELETE /api/watchlist/:movieId - should return 404 if movie is not in watchlist", async () => {
  const response = await request(app)
    .delete(`/api/watchlist/${movieId}`)
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(response.statusCode, 404);
  assert.strictEqual(
    response.body.message,
    "Movie not found in watchlist.",
  );
});

test("DELETE /api/watchlist/:movieId - should reject unauthenticated request", async () => {
  const response = await request(app)
    .delete(`/api/watchlist/${movieId}`);

  assert.strictEqual(response.statusCode, 401);
});
</file>

<file path="src/controllers/watchlist_controller.js">
import pool from "../config/db.js";
import { updateWatchlistSchema } from "../validators/watchlist_validator.js";
import { movieIdParamSchema } from "../validators/param_validator.js";

export const addMovie = async (req, res, next) => {
  try {
    const result = movieIdParamSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid movie ID.",
      });
    }

    const { movieId } = result.data;
    const movieResult = await pool.query(
      `
      select id from movies where id=$1
      `,
      [movieId],
    );

    if (movieResult.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found.",
      });
    }

    const userId = req.user.userId;

    await pool.query(
      `insert into watchlist_items (user_id,movie_id) values ($1,$2)`,
      [userId, movieId],
    );

    return res.status(201).json({
      message: "Movie added to watchlist.",
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Movie already in the watchlist.",
      });
    }
    next(err);
  }
};

export const getWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    console.log("USER ID:", userId);

    const result = await pool.query(
      `
            select w.id,w.movie_id,m.title,m.release_year,m.genre,m.description,w.status,w.added_at,w.watched_at from watchlist_items w join movies m on w.movie_id = m.id where w.user_id = $1 order by w.added_at desc;
            `,
      [userId],
    );

    return res.status(200).json({
      watchlist: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const bodyResult = updateWatchlistSchema.safeParse(req.body);

    if (!bodyResult.success) {
      return res.status(400).json({
        message: "Validation failed.",
      });
    }

    const paramResult = movieIdParamSchema.safeParse(req.params);

    if (!paramResult.success) {
      return res.status(400).json({
        message: "Invalid movie ID.",
      });
    }
    const { status } = bodyResult.data;
    const { movieId } = paramResult.data;
    const userId = req.user.userId;
    const watchedAt = status === "watched" ? new Date() : null;
    const updatedMovie = await pool.query(
      `
  UPDATE watchlist_items
  SET
    status = $1,
    watched_at = $2
  WHERE user_id = $3
    AND movie_id = $4
  RETURNING id, movie_id, status, added_at, watched_at;
  `,
      [status, watchedAt, userId, movieId],
    );

    if (updatedMovie.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found in watchlist.",
      });
    }

    return res.status(200).json({
      message: "Watchlist status updated",
      watchlistItem: updatedMovie.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const removeMovie = async (req, res, next) => {
  try {
    const result = movieIdParamSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid movie ID.",
      });
    }

    const { movieId } = result.data;
    const userId = req.user.userId;

    const deleteResult = await pool.query(
      `
            delete from watchlist_items where user_id = $1 and movie_id = $2 
            returning id;
            `,
      [userId, movieId],
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found in watchlist.",
      });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
</file>

<file path="src/app.js">
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
</file>

</files>
