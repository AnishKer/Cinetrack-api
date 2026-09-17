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
