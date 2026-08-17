<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'EduFlow Backend API is running successfully!'
    ]);
});
