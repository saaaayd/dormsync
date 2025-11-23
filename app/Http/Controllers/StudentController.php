<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index()
    {
        return User::where('role', 'student')->with('studentProfile')->latest()->get();
    }

    public function store(Request $request)
    {
        // Transaction ensures data integrity
        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make('password'),
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

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        DB::transaction(function () use ($request, $user) {
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
            ]);

            // Update profile or create if it doesn't exist
            $user->studentProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'room_number' => $request->room_number,
                    'phone_number' => $request->phone_number,
                    'emergency_contact_name' => $request->emergency_contact_name,
                    'emergency_contact_phone' => $request->emergency_contact_phone,
                    'status' => $request->status ?? 'active',
                ]
            );
        });

        return $user->load('studentProfile');
    }

    public function destroy($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Student deleted']);
    }
}