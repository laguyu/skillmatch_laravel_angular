<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\JobApplicationController;
use App\Http\Controllers\Api\V1\JobController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    Route::apiResource('jobs', JobController::class)->only(['index', 'show']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('my/jobs', [JobController::class, 'mine']);
        Route::apiResource('jobs', JobController::class)->only(['store', 'update', 'destroy']);
        Route::post('jobs/{job}/applications', [JobApplicationController::class, 'store']);
        Route::apiResource('applications', JobApplicationController::class)->except(['store']);
    });
});
