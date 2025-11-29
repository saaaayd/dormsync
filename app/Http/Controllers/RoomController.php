<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        return Room::withCount('students')
            ->orderBy('code')
            ->get();
    }

    public function store(Request $request)
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'code' => 'required|string|max:255|unique:rooms,code',
            'capacity' => 'required|integer|min:1|max:50',
        ]);

        return Room::create($validated);
    }

    public function update(Request $request, Room $room)
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'code' => "sometimes|string|max:255|unique:rooms,code,{$room->id}",
            'capacity' => 'sometimes|integer|min:1|max:50',
        ]);

        $room->update($validated);

        return $room->refresh()->loadCount('students');
    }

    public function destroy(Request $request, Room $room)
    {
        $this->ensureAdmin($request);

        if ($room->students()->exists()) {
            abort(422, 'Cannot delete a room that still has assigned students.');
        }

        $room->delete();

        return response()->noContent();
    }

    private function ensureAdmin(Request $request): void
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            abort(403, 'Only administrators can manage rooms.');
        }
    }
}


