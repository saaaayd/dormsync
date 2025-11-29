<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\User;
use App\Services\StudentIdGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function __construct(private readonly StudentIdGenerator $studentIdGenerator)
    {
    }

    public function index()
    {
        return User::where('role', 'student')
            ->with('studentProfile.room')
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_initial' => 'nullable|string|max:5',
            'email' => 'required|email|unique:users,email',
            'student_id' => 'nullable|string|unique:users,student_id',
            'room_id' => 'required|exists:rooms,id',
            'phone_number' => 'nullable|string|max:50',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:50',
        ]);

        $room = Room::findOrFail($validated['room_id']);
        $this->guardCapacity($room);

        $fullName = $validated['first_name'] . ' ' .
            (!empty($validated['middle_initial']) ? $validated['middle_initial'] . '. ' : '') .
            $validated['last_name'];

        $user = DB::transaction(function () use ($validated, $fullName, $room) {
            $user = User::create([
                'student_id' => $validated['student_id'] ?? $this->studentIdGenerator->next(),
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'middle_initial' => $validated['middle_initial'] ?? null,
                'name' => $fullName,
                'email' => $validated['email'],
                'password' => Hash::make('ChangeMe123!'),
                'role' => 'student',
            ]);

            $user->studentProfile()->create([
                'room_id' => $room->id,
                'room_number' => $room->code,
                'phone_number' => $validated['phone_number'] ?? '',
                'emergency_contact_name' => $validated['emergency_contact_name'] ?? '',
                'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? '',
                'enrollment_date' => now(),
                'status' => 'active',
            ]);

            return $user;
        });

        return $user->load('studentProfile.room');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_initial' => 'nullable|string|max:5',
            'email' => "required|email|unique:users,email,{$user->id}",
            'student_id' => "nullable|string|unique:users,student_id,{$user->id}",
            'room_id' => 'nullable|exists:rooms,id',
            'phone_number' => 'nullable|string|max:50',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive',
        ]);

        $room = isset($validated['room_id']) ? Room::findOrFail($validated['room_id']) : null;
        if ($room) {
            $this->guardCapacity($room, $user->id);
        }

        DB::transaction(function () use ($user, $validated, $room) {
            $fullName = $validated['first_name'] . ' ' .
                (!empty($validated['middle_initial']) ? $validated['middle_initial'] . '. ' : '') .
                $validated['last_name'];

            $user->update([
                'student_id' => $validated['student_id'] ?? $user->student_id ?? $this->studentIdGenerator->next(),
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'middle_initial' => $validated['middle_initial'] ?? null,
                'name' => $fullName,
                'email' => $validated['email'],
            ]);

            $user->studentProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'room_id' => $room?->id ?? $user->studentProfile?->room_id,
                    'room_number' => $room?->code ?? $user->studentProfile?->room_number ?? '',
                    'phone_number' => $validated['phone_number'] ?? $user->studentProfile?->phone_number ?? '',
                    'emergency_contact_name' => $validated['emergency_contact_name'] ?? $user->studentProfile?->emergency_contact_name ?? '',
                    'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? $user->studentProfile?->emergency_contact_phone ?? '',
                    'status' => $validated['status'] ?? $user->studentProfile?->status ?? 'active',
                ]
            );
        });

        return $user->load('studentProfile.room');
    }

    public function destroy($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Student deleted']);
    }

    private function guardCapacity(Room $room, ?int $ignoreUserId = null): void
    {
        $occupants = $room->students()
            ->when($ignoreUserId, fn ($query) => $query->where('user_id', '<>', $ignoreUserId))
            ->count();

        if ($occupants >= $room->capacity) {
            abort(422, 'Room is already full.');
        }
    }
}
<?php
