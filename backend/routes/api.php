<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\FeeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected routes (requires valid Sanctum token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard (role-aware inside the controller)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Notifications - any authenticated user
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead']);

    /*
    |----------------------------------------------------------------
    | Admin only
    |----------------------------------------------------------------
    */
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('students', StudentController::class);
        Route::apiResource('teachers', TeacherController::class);
        Route::post('/classes/{class}/assign-teacher', [ClassController::class, 'assignTeacher']);
        Route::post('/classes/{class}/enroll', [ClassController::class, 'enrollStudent']);
        Route::delete('/classes/{class}/students/{student}', [ClassController::class, 'unenrollStudent']);
        Route::post('/notifications', [NotificationController::class, 'store']);
    });

    /*
    |----------------------------------------------------------------
    | Admin + Teacher
    |----------------------------------------------------------------
    */
    Route::middleware('role:admin,teacher')->group(function () {
        Route::apiResource('classes', ClassController::class)->except(['destroy']);
        Route::delete('/classes/{class}', [ClassController::class, 'destroy'])->middleware('role:admin');

        Route::post('/attendance/bulk', [AttendanceController::class, 'storeBulk']);
        Route::get('/attendance', [AttendanceController::class, 'index']);

        Route::apiResource('exams', ExamController::class);
        Route::post('/exams/{exam}/marks', [ExamController::class, 'storeMarks']);
        Route::patch('/exams/{exam}/publish', [ExamController::class, 'publish']);

        Route::get('/fees', [FeeController::class, 'index']);
        Route::post('/fees', [FeeController::class, 'store']);
        Route::patch('/fees/{fee}', [FeeController::class, 'update']);
    });

    /*
    |----------------------------------------------------------------
    | Student (read-only, own data enforced in controllers)
    |----------------------------------------------------------------
    */
    Route::middleware('role:student')->group(function () {
        Route::get('/my/classes', [StudentController::class, 'myClasses']);
        Route::get('/my/attendance', [StudentController::class, 'myAttendance']);
        Route::get('/my/results', [StudentController::class, 'myResults']);
        Route::get('/my/fees', [StudentController::class, 'myFees']);
        Route::get('/my/performance', [StudentController::class, 'myPerformance']);
    });
});
