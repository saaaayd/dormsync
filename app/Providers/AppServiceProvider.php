<?php

namespace App\Providers;

use App\Services\GoogleCalendarService;
use App\Services\GoogleDriveService;
use App\Services\RecaptchaService;
use App\Services\StudentIdGenerator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(GoogleDriveService::class, function () {
            return new GoogleDriveService(config('services.google_drive', []));
        });

        $this->app->singleton(GoogleCalendarService::class, fn () => new GoogleCalendarService());
        $this->app->singleton(RecaptchaService::class, fn () => new RecaptchaService());
        $this->app->singleton(StudentIdGenerator::class, fn () => new StudentIdGenerator());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
    }
}
