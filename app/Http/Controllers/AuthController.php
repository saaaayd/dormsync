<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\RecaptchaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function __construct(
        private readonly RecaptchaService $recaptcha,
    ) {
    }

    public function register(Request $request): JsonResponse
    {
        $this->recaptcha->ensureHuman($request->input('recaptcha_token'), 'register');

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_initial' => 'nullable|string|max:5',
            'email' => 'required|email|unique:users,email',
            'student_id' => 'required|string|unique:users,student_id',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = DB::transaction(function () use ($validated) {
            $fullName = $validated['first_name'] . ' ' .
                (!empty($validated['middle_initial']) ? $validated['middle_initial'] . '. ' : '') .
                $validated['last_name'];

            $user = User::create([
                'student_id' => $validated['student_id'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'middle_initial' => $validated['middle_initial'] ?? null,
                'name' => $fullName,
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'student',
            ]);

            $user->studentProfile()->create([
                'room_number' => '',
                'phone_number' => '',
                'emergency_contact_name' => '',
                'emergency_contact_phone' => '',
                'enrollment_date' => now(),
                'status' => 'active',
            ]);

            return $user;
        });

        return response()->json($user->load('studentProfile.room'), 201);
    }

    public function login(Request $request): JsonResponse
    {
        $this->recaptcha->ensureHuman($request->input('recaptcha_token'), 'login');

        $credentials = $request->validate([
            'identifier' => 'required|string',
            'password' => 'required|string',
        ]);

        $identifier = $credentials['identifier'];
        $field = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'student_id';

        $user = User::with('studentProfile.room')
            ->where($field, $identifier)
            ->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        $token = $user->createToken('dormsync')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function redirectToGoogle()
    {
        $this->ensureGoogleConfigured();
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        $this->ensureGoogleConfigured();

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Throwable $exception) {
            report($exception);
            $redirect = config('services.google.frontend_redirect');

            if ($redirect) {
                return redirect()->away($redirect . '?error=oauth_failed');
            }

            return response()->json(['message' => 'Unable to authenticate with Google'], 422);
        }

        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'first_name' => $googleUser->user['given_name'] ?? $googleUser->getName(),
                'last_name' => $googleUser->user['family_name'] ?? '',
                'name' => $googleUser->getName() ?: $googleUser->getEmail(),
                'password' => Hash::make(Str::random(16)),
                'role' => 'student',
            ]
        );

        $user->studentProfile()->firstOrCreate(
            [],
            [
                'room_number' => '',
                'phone_number' => '',
                'emergency_contact_name' => '',
                'emergency_contact_phone' => '',
                'enrollment_date' => now(),
                'status' => 'active',
            ]
        );

        $token = $user->createToken('dormsync-google')->plainTextToken;
        $payload = [
            'token' => $token,
            'user' => $user->load('studentProfile.room'),
        ];

        $redirect = config('services.google.frontend_redirect');
        if (!$redirect) {
            return response()->json($payload);
        }

        $query = http_build_query([
            'token' => $payload['token'],
            'user' => base64_encode(json_encode($payload['user'])),
        ]);

        return redirect()->away($redirect . '?' . $query);
    }

    private function ensureGoogleConfigured(): void
    {
        if (!config('services.google.client_id') || !config('services.google.client_secret')) {
            abort(503, 'Google login is not configured.');
        }
    }
}
