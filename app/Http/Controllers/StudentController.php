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
        // Fetches users with their profiles
        return User::where('role', 'student')->with('studentProfile')->latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'room_number' => 'required',
        ]);

        return DB::transaction(function () use ($request) {
            // Construct full name for display/compatibility
            $fullName = $request->first_name . ' ' . 
                       ($request->middle_initial ? $request->middle_initial . '. ' : '') . 
                       $request->last_name;

            $user = User::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'middle_initial' => $request->middle_initial,
                'name' => $fullName, // Saves the combined name
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
            // Reconstruct full name if changed
            $fullName = $request->first_name . ' ' . 
                       ($request->middle_initial ? $request->middle_initial . '. ' : '') . 
                       $request->last_name;

            $user->update([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'middle_initial' => $request->middle_initial,
                'name' => $fullName,
                'email' => $request->email,
            ]);

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