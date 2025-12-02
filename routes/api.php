<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\MaintenanceRequestController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\CleaningScheduleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoomController;

/**
 * NOTE (DEV MODE):
 * The frontend currently uses a mock authentication context (no Sanctum tokens),
 * so we expose most API resources outside the Sanctum middleware group to allow
 * the React app to call them without authentication during development.
 */

Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/register', [AuthController::class, 'register']);
Route::get('auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Public (no Sanctum) API endpoints for the current mock-auth/frontend
Route::post('payments/bulk', [PaymentController::class, 'bulkStore']);
Route::apiResource('payments', PaymentController::class);
Route::apiResource('maintenance-requests', MaintenanceRequestController::class);
Route::apiResource('announcements', AnnouncementController::class);
Route::apiResource('attendance', AttendanceController::class)->only(['index', 'store', 'update']);
Route::apiResource('cleaning-schedule', CleaningScheduleController::class)->only(['index', 'store', 'update', 'destroy']);
Route::get('/dashboard/stats', [DashboardController::class, 'index']);

// FIX: Moved 'students' here so the frontend can populate dropdowns without a token
Route::apiResource('students', StudentController::class);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->load('studentProfile.room');
    });

    Route::apiResource('rooms', RoomController::class);
});