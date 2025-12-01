<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class RecaptchaService
{
    public function ensureHuman(?string $token, string $action = 'global'): void
    {
        if ($this->shouldSkip()) {
            return;
        }

        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => config('services.recaptcha.secret'),
            'response' => $token,
        ]);

        if (!$response->ok()) {
            abort(422, 'Unable to contact ReCAPTCHA.');
        }

        $payload = $response->json();
        if (!($payload['success'] ?? false)) {
            abort(422, 'ReCAPTCHA failed validation.');
        }

        $score = $payload['score'] ?? 0;
        $min = (float) config('services.recaptcha.score', 0.5);

        if ($score < $min) {
            abort(422, 'ReCAPTCHA score too low.');
        }
    }

    private function shouldSkip(): bool
    {
        return empty(config('services.recaptcha.secret')) ||
            filter_var(config('services.recaptcha.skip'), FILTER_VALIDATE_BOOL);
    }
}



