# EduFlow — Run කරන ආකාරය (සම්පූර්ණ Guide)

මේ zip එකේ `backend/` සහ `frontend/` කියලා folder දෙකක් තියෙනවා. Laravel core logic
files (migrations, models, controllers, routes, seeders) සහ React frontend files
ටික සම්පූර්ණයෙන් තියෙනවා. Laravel framework skeleton එක (`artisan`, `composer.json`,
`config/` ආදිය) නෑ නිසා පහත steps අනුගමනය කරන්න.

## Backend (Laravel)

1. **Fresh Laravel project එකක් හදන්න** (PHP 8.2+, Composer install කරලා තියෙන්න ඕන):
   ```bash
   composer create-project laravel/laravel eduflow-backend
   ```

2. **මේ zip එකේ `backend/` folder එකේ තියෙන අඩංගුව**, අලුතින් හදපු `eduflow-backend/`
   project එකට copy කරන්න (existing files replace කරන්න):
   - `app/` → `eduflow-backend/app/`
   - `database/migrations/` සහ `database/seeders/` → `eduflow-backend/database/`
   - `routes/api.php` → replace කරන්න
   - `bootstrap/app.php` → replace කරන්න
   - `.env.example` → replace කරන්න (හෝ merge කරන්න)

3. **Sanctum install කරන්න**:
   ```bash
   cd eduflow-backend
   composer require laravel/sanctum
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   ```

4. **`.env` සකස් කරන්න**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   `.env` එකේ `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` ඔයාගේ MySQL setup එකට
   match වෙන්න සකස් කරන්න (XAMPP/Laragon පාවිච්චි කරනවා නම් default `root` /
   empty password එක වැඩ කරයි). MySQL Workbench එකෙන් හෝ terminal එකෙන් `eduflow`
   කියලා empty database එකක් හදාගන්න.

5. **Migrate + seed**:
   ```bash
   php artisan migrate --seed
   ```

6. **Server එක start කරන්න**:
   ```bash
   php artisan serve
   ```
   API එක `http://localhost:8000/api` වල run වෙනවා. මේ terminal එක open කරගෙන
   තියාගන්න.

## Frontend (React) — අලුත් terminal එකක්

1. `frontend/` folder එකට cd වෙන්න (Node.js 18+ install කරලා තියෙන්න ඕන):
   ```bash
   cd frontend
   npm install
   ```

2. Environment සකස් කරන්න:
   ```bash
   cp .env.example .env
   ```
   `.env` එකේ `VITE_API_BASE_URL=http://localhost:8000/api` කියලා තියෙනවා —
   backend එක වෙනත් port එකක run කරනවා නම් මේක update කරන්න.

3. Dev server start කරන්න:
   ```bash
   npm run dev
   ```
   App එක `http://localhost:5173` වල open වෙනවා.

## Login (Demo Credentials)

Password හැම account එකකටම: `password`

| Role    | Email                 |
|---------|------------------------|
| Admin   | admin@eduflow.test     |
| Teacher | teacher1@eduflow.test  |
| Student | student1@eduflow.test  |

(student2..student20@eduflow.test, teacher2@eduflow.test ද තියෙනවා — `UserSeeder.php` බලන්න)

## දෝෂ නිරාකරණය (Troubleshooting)

- **CORS error** browser console එකේ පෙන්නනවා නම්: Laravel 11 වල `bootstrap/app.php`
  එකේ Sanctum middleware register වෙලා තියෙනවාද බලන්න (මේ zip එකේ `bootstrap/app.php`
  දීලා තියෙන්නේ ඒක handle කරන විදිහට).
- **419 / 401 errors**: `.env` එකේ `SANCTUM_STATEFUL_DOMAINS` සහ frontend
  `VITE_API_BASE_URL` port numbers දෙකම match වෙනවාද බලන්න.
- **Migration errors**: `eduflow` database එක හිස් (empty) ද, සහ MySQL service එක
  run වෙනවාද confirm කරන්න.
