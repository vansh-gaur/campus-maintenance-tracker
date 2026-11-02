# Campus Maintenance Tracker

A web app for tracking hostel and campus maintenance complaints. Students raise
complaints (plumbing, electrical, Wi-Fi, furniture, cleaning, and more), and
admins update their status and leave comments as work progresses.

## Tech stack

- Frontend: React with Vite
- Backend: Node.js with Express
- Database: SQLite, accessed through Node's built-in `node:sqlite` module
- Auth: JSON Web Tokens, with passwords hashed using bcrypt (bcryptjs)

Node 22.5 or newer is required for `node:sqlite`. This project was tested on
Node 24. better-sqlite3 was tried first, but its native build failed in the
environment used for development, so the built-in SQLite module is used instead.

## Features

- User registration and login, with student and admin roles
- Create complaints with a title, description, category, priority, and location
- List complaints with filtering by status, category, and priority, plus search
  across title, description, and location
- Status workflow: Open -> In Progress -> Resolved (admins only, forward only)
- Comments and updates on each complaint
- Dashboard with counts by status and category

## How to run

You need two terminals: one for the backend, one for the frontend.

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

The backend runs on http://localhost:5000 by default. Set `PORT` and
`JWT_SECRET` in `.env` to change them.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:5173 and proxies `/api` requests to the
backend, so both need to be running at the same time.

For a production build of the frontend only:

```bash
cd frontend
npm run build
```

## Demo accounts

These accounts are created automatically the first time the backend starts, if
the database is empty. The database also gets three example complaints so the
dashboard is not empty on first login.

| Role    | Email              | Password   |
| ------- | ------------------ | ---------- |
| Admin   | admin@demo.local   | Admin123   |
| Student | student@demo.local | Student123 |

Change or remove these accounts before using the app anywhere other than
locally.

## Project structure

```
campus-maintenance-tracker/
  README.md
  backend/
    package.json
    .env.example
    src/
      server.js
      db.js
      middleware/
        auth.js
      routes/
        auth.js
        complaints.js
        stats.js
  frontend/
    package.json
    vite.config.js
    index.html
    src/
      main.jsx
      App.jsx
      api.js
      styles.css
      components/
        ComplaintForm.jsx
        ComplaintList.jsx
      pages/
        AuthPage.jsx
        Dashboard.jsx
        ComplaintDetail.jsx
```

The backend stores its data in `backend/maintenance.db`, which is created on
first start and is ignored by git. Delete that file to reset the app back to
the demo accounts and example complaints.

## API overview

All complaint and stats routes require an `Authorization: Bearer <token>`
header.

- `POST /api/auth/register` — create an account
- `POST /api/auth/login` — log in, returns a user and a token
- `GET /api/auth/me` — current user
- `GET /api/complaints?status=&category=&priority=&search=` — list complaints
- `POST /api/complaints` — raise a complaint
- `GET /api/complaints/:id` — one complaint with its comments
- `PATCH /api/complaints/:id/status` — change status (admin only)
- `POST /api/complaints/:id/comments` — add a comment
- `GET /api/stats` — counts by status, category, and priority

## Limitations

- Anyone can register as an admin from the signup form. That is fine for a
  demo, but in a real deployment admin accounts should be created by an
  existing admin, not by self-registration.
- If `JWT_SECRET` is not set, the backend falls back to a development secret.
  Always set it in production.
- There are no email notifications, file uploads, or password reset flows.
- Complaints are not assigned to individual staff members yet, and the list
  is not paginated, so this fits a campus demo rather than a large deployment.
- A resolved complaint cannot be reopened from the status control.

## Future improvements

- Assign complaints to staff and let students see only their own complaints
  by default, with admins seeing everything
- Email or in-app notifications when a complaint's status changes
- Photo uploads for complaints
- Pagination and sorting on the complaint list
- Tests for the backend routes
