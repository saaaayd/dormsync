<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController; // Import the controller

// Route to get the current user
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Payment Routes (Protected by Sanctum authentication)
Route::middleware('auth:sanctum')->group(function () {
    // This creates routes for: index (list), store (create), show, update, destroy (delete)
    Route::apiResource('payments', PaymentController::class);
});