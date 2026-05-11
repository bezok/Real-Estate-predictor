# Real Estate Predictor — Runbook

## Project Structure

```
App/
├── django/          # Django backend (API + ML prediction)
│   ├── manage.py
│   ├── db.sqlite3
│   ├── requirements.txt
│   ├── real_estate_project/   # Django project settings
│   └── price_prediction/      # Main app (models, views, ML)
└── Frontend/
    └── frontend/              # React + Vite frontend
```

---

## Running the Backend (Django)

### Prerequisites
- Python 3.11+

### Steps

```powershell
cd App\django
```

Install dependencies (first time only):

```powershell
pip install -r requirements.txt
```

Apply migrations and start the server:

```powershell
python manage.py migrate
python manage.py runserver
```

The backend runs at **http://127.0.0.1:8000**

---

## Running the Frontend (React + Vite)

### Prerequisites
- Node.js 18+ and npm

### Steps

```powershell
cd App\Frontend\frontend
```

Install dependencies (first time only):

```powershell
npm install
```

Start the dev server:

```powershell
npm run dev
```

The frontend runs at **http://localhost:5173**

The frontend expects the Django backend to be running at `http://127.0.0.1:8000`. Always start the backend first.

---

## Creating a Superuser / Fresh Admin Account

```powershell
cd App\django
python manage.py createsuperuser
```

Follow the prompts to set a username, email, and password.

Access the Django admin panel at **http://127.0.0.1:8000/admin**

---

## Resetting the Database (Fresh Start)

This wipes all data and user accounts and starts from scratch.

```powershell
cd App\django
```

**Step 1 — Delete the existing database:**

```powershell
Remove-Item db.sqlite3
```

**Step 2 — Delete migration history (optional — only if you changed models):**

```powershell
Remove-Item price_prediction\migrations\0*.py
```

> Skip step 2 if you haven't changed any models. Keeping migrations avoids re-running `makemigrations`.

**Step 3 — Recreate migrations (only if you did step 2):**

```powershell
python manage.py makemigrations price_prediction
```

**Step 4 — Apply migrations:**

```powershell
python manage.py migrate
```

**Step 5 — Create a new superuser:**

```powershell
python manage.py createsuperuser
```

**Step 6 — Start the server:**

```powershell
python manage.py runserver
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start backend | `cd App\django && python manage.py runserver` |
| Start frontend | `cd App\Frontend\frontend && npm run dev` |
| Create admin user | `python manage.py createsuperuser` |
| Wipe DB (keep migrations) | `Remove-Item db.sqlite3 && python manage.py migrate` |
| Full reset (wipe DB + migrations) | Delete `db.sqlite3` + `0*.py` files, then `makemigrations` + `migrate` |
| Admin panel | http://127.0.0.1:8000/admin |
| Frontend | http://localhost:5173 |
