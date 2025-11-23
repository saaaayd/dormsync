<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\MaintenanceRequestController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\DashboardController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->load('studentProfile');
    });

    // Resources
    Route::apiResource('payments', PaymentController::class);
    Route::apiResource('students', StudentController::class);
    Route::apiResource('maintenance-requests', MaintenanceRequestController::class);
    Route::apiResource('announcements', AnnouncementController::class);
    
    // Dashboard Stats
    Route::get('/dashboard/stats', [DashboardController::class, 'index']);
});