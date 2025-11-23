<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index()
    {
        // Return users who are students, with their profile data
        return User::where('role', 'student')->with('studentProfile')->get();
    }

    public function store(Request $request)
    {
        // Use Transaction to ensure both User and Profile are created, or neither
        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make('password'), // Default password
                'role' => 'student',
            ]);

            $user->studentProfile()->create([
                'room_number' => $request->room_number,
                'phone_number' => $request->phone_number,
                'emergency_contact_name' => $request->emergency_contact_name,
                'emergency_contact_phone' => $request->emergency_contact_phone,
                'enrollment_date' => now(),
                'status' => 'active',
            ]);

            return $user->load('studentProfile');
        });
    }

    public function destroy($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Student deleted']);
    }
}