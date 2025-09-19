# Ideal Test Site – Backend

## Setup

No local setup required! Just upload these files to your repo (in the `backend/` folder).

## Deployment

- Use [Railway](https://railway.app/) or [Render](https://render.com/)
- Set **root directory** to `backend` when deploying!

## Default Admin

- Username: `admin`
- Password: `adminpass`

## Endpoints

- `/api/auth/register` – Register new user
- `/api/auth/login` – Login (returns JWT)
- `/api/entries/wall` – Public feed (no auth)
- `/api/entries` – User’s entries (CRUD, JWT required)
- `/api/admin/*` – Admin only (JWT required, admin user)

## Environment

- Uses SQLite by default (`data.db`). For Postgres, modify `db.js`.