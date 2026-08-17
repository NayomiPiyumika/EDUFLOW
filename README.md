# EduFlow — Smart Tuition & Student Management System

A full-stack tuition/class management platform built with **Laravel 11** (API backend) and
**React 18 + Vite + Tailwind** (frontend), using **Sanctum** for token-based authentication
and role-based access control (Admin / Teacher / Student).

## Project Structure

```
eduflow/
├── backend/    Laravel API (migrations, models, controllers, routes, seeders)
└── frontend/   React SPA (Vite, Tailwind, Recharts, Axios)
```

## Features

- **Role-based access**: Admin, Teacher, Student — each with a dedicated dashboard and permissions.
- **Student & Teacher management**: CRUD with search and status control.
- **Class management**: create classes, assign teachers, enroll/unenroll students.
- **Attendance**: bulk mark present/late/absent per class per session; students view their own history.
- **Exams & Marks**: create exams, enter marks (auto-graded A+/A/B/C/S/F), publish results to students.
- **Fees**: monthly fee tracking, partial/full payment recording, outstanding balance calculation.
- **Notifications**: admin announcements targeted by role, per-user notifications, read/unread state.
- **Dashboards**: charts (Recharts) for student growth, revenue trend, attendance and performance.

## Backend Setup (Laravel)

```bash
cd backend

# 1. Install dependencies
composer install

# 2. Environment
cp .env.example .env
php artisan key:generate

# 3. Configure your database in .env (MySQL or SQLite)
DB_CONNECTION=mysql
DB_DATABASE=eduflow
DB_USERNAME=root
DB_PASSWORD=

# 4. Install Sanctum (if not already present in composer.json)
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 5. Run migrations + seed demo data
php artisan migrate --seed

# 6. Serve the API
php artisan serve
# API available at http://localhost:8000/api
```

### Demo Credentials (from UserSeeder)

| Role    | Email                  | Password |
|---------|-------------------------|----------|
| Admin   | admin@eduflow.test       | password |
| Teacher | teacher1@eduflow.test    | password |
| Teacher | teacher2@eduflow.test    | password |
| Student | student1@eduflow.test    | password |
| Student | student2@eduflow.test .. student20@eduflow.test | password |

## Frontend Setup (React)

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Environment
cp .env.example .env
# Set VITE_API_BASE_URL to match your backend (default: http://localhost:8000/api)

# 3. Run the dev server
npm run dev
# App available at http://localhost:5173
```

## API Overview

All endpoints are prefixed with `/api` and (except `/login`) require a Bearer token
issued by `POST /login`.

| Method | Endpoint                          | Access          |
|--------|-------------------------------------|-----------------|
| POST   | /login                              | Public          |
| POST   | /logout                             | Authenticated   |
| GET    | /me                                  | Authenticated   |
| GET    | /dashboard                           | Authenticated (role-aware) |
| GET/POST/PATCH/DELETE | /students                | Admin           |
| GET/POST/PATCH/DELETE | /teachers                | Admin           |
| GET/POST/PATCH/DELETE | /classes                 | Admin, Teacher (own classes) |
| POST   | /classes/{id}/assign-teacher          | Admin           |
| POST   | /classes/{id}/enroll                  | Admin           |
| DELETE | /classes/{id}/students/{studentId}    | Admin           |
| GET/POST | /attendance / /attendance/bulk      | Admin, Teacher  |
| GET/POST/PATCH/DELETE | /exams                    | Admin, Teacher  |
| POST   | /exams/{id}/marks                     | Admin, Teacher  |
| PATCH  | /exams/{id}/publish                    | Admin, Teacher  |
| GET/POST/PATCH | /fees                          | Admin, Teacher  |
| GET/POST | /notifications                       | Authenticated (GET), Admin (POST) |
| GET    | /my/classes, /my/attendance, /my/results, /my/fees, /my/performance | Student |

## Tech Stack

- **Backend**: Laravel 11, Sanctum (API tokens), MySQL/SQLite, PHP 8.2+
- **Frontend**: React 18, Vite, React Router 6, Tailwind CSS, Axios, Recharts, Lucide icons

## Grading Scheme (auto-calculated)

| Percentage | Grade |
|------------|-------|
| 90–100%    | A+    |
| 80–89%     | A     |
| 70–79%     | B     |
| 60–69%     | C     |
| 50–59%     | S     |
| Below 50%  | F     |

## Notes

- Attendance and marks use `updateOrCreate` guarded by DB unique constraints, so re-submitting
  the same class/date or exam/student combination safely updates the existing record instead
  of creating duplicates.
- Fee status (`paid` / `partial` / `unpaid`) is recalculated automatically whenever a payment
  is recorded, via `Fee::recalculate()`.
- Frontend auth state is restored on page reload by validating the stored token against `GET /me`;
  an expired/invalid token triggers an automatic logout and redirect to `/login` (see the Axios
  response interceptor in `src/services/api.js`).
