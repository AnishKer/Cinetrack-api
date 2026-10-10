# CineTrack Frontend

The frontend for **CineTrack — Movie Watchlist & Review API**, a movie discovery application with authentication, personalized watchlists, and movie reviews.

## Tech Stack

- React
- Vite
- JavaScript
- Tailwind CSS v4
- React Router
- Fetch API for backend communication

## Prerequisites

Before running the frontend, ensure you have installed:

- [Node.js](https://nodejs.org/) — preferably an active LTS version
- npm (included with Node.js)
- The CineTrack backend, configured with PostgreSQL and its required environment variables

## Getting Started

### 1. Clone the Repository

If you haven't cloned the project yet:

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_NAME>
```

Replace the placeholders with your actual Git repository URL and repository name.

### 2. Navigate to the Frontend

```bash
cd frontend
```

### 3. Install Dependencies

```bash
npm install
```

This installs the packages required to run the React application.

### 4. Start the Backend

Open a separate terminal and start the CineTrack backend using the setup instructions in the root README or backend README.

Make sure the backend is running on:

```text
http://localhost:5000
```

The backend requires a configured PostgreSQL database and its required environment variables.

### 5. Start the Frontend

From the `frontend/` directory, run:

```bash
npm run dev
```

Vite will display the local development URL in the terminal. By default, it is:

```text
http://localhost:5173
```

Open that URL in your browser.

## API Configuration

During development, Vite proxies requests beginning with `/api` to the backend at `http://localhost:5000`.

For example:

```text
Frontend request:
GET /api/movies

Proxied backend request:
GET http://localhost:5000/api/movies
```

This configuration is defined in `vite.config.js`.

Because the frontend uses relative `/api` URLs, a separate frontend API base URL is not required for the current local development setup.

## Available Features

- User registration and login
- JWT-based authenticated sessions
- Movie catalog browsing
- Movie title search
- Genre and release-year filtering
- Sorting and pagination
- Personal watchlist management
- Planned and Watched status tracking
- Movie ratings and written reviews
- Review deletion with author ownership checks
- Responsive desktop, tablet, and mobile layouts

## Troubleshooting

### The frontend cannot load movies

- Confirm the backend is running on port `5000`.
- Verify that the PostgreSQL database is configured and accessible.
- Check the browser's Network tab for failed `/api` requests.
- Check the backend terminal for errors.

### Login or registration fails

- Confirm the backend is running.
- Check the response from `/api/auth/login` or `/api/auth/register` in the Network tab.
- Verify the backend environment variables and database connection.

### Dependencies fail to install

Check your Node.js and npm versions:

```bash
node --version
npm --version
```

Then retry:

```bash
npm install
```

### Port 5173 is already in use

Vite may offer another available port in the terminal. Open the URL it reports.

## Development Notes

- Frontend source code is located in `src/`.
- Page components are located in `src/pages/`.
- Authentication state is managed through the existing React authentication context.
- API requests use the Vite development proxy.
- The backend remains responsible for authentication enforcement, validation, database operations, and review ownership checks.

## License

This project is intended as a frontend engineering project for learning, practice, and portfolio purposes.
