<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * Student registration (only role allowed here).
     * There should be only one admin, created separately (seeder/manual).
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_initial' => 'nullable|string|max:5',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'room_number' => 'nullable|string|max:50',
            'phone_number' => 'nullable|string|max:50',
        ]);

        return DB::transaction(function () use ($validated) {
            $fullName = $validated['first_name'] . ' ' .
                (!empty($validated['middle_initial']) ? $validated['middle_initial'] . '. ' : '') .
                $validated['last_name'];

            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'middle_initial' => $validated['middle_initial'] ?? null,
                'name' => $fullName,
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'student',
            ]);

            // Optional profile data
            $user->studentProfile()->create([
                'room_number' => $validated['room_number'] ?? '',
                'phone_number' => $validated['phone_number'] ?? '',
                'emergency_contact_name' => '',
                'emergency_contact_phone' => '',
                'enrollment_date' => now(),
                'status' => 'active',
            ]);

            return $user->load('studentProfile');
        });
    }

    /**
     * Basic email/password login.
     * Returns the user with studentProfile (no tokens for now).
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with('studentProfile')->where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        return $user;
    }
}


