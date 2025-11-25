<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceRequest;
use Illuminate\Http\Request;
use App\Models\User;

class MaintenanceRequestController extends Controller
{
    public function index(Request $request)
    {
        // For now, expose all maintenance requests (admin dashboard view).
        // When real auth is wired, you can re-introduce per-student scoping.
        return MaintenanceRequest::with('student')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id'   => 'required|exists:users,id',
            'title'        => 'required|string|max:255',
            'description'  => 'required|string',
            'urgency'      => 'required|in:low,medium,high',
            'room_number'  => 'nullable|string',
            'status'       => 'nullable|in:pending,in-progress,resolved',
        ]);

        // If room_number not provided, fall back to student's profile room
        if (empty($validated['room_number'])) {
            $student = User::with('studentProfile')->find($validated['student_id']);
            $validated['room_number'] = $student?->studentProfile->room_number ?? 'N/A';
        }

        // Default status
        if (empty($validated['status'])) {
            $validated['status'] = 'pending';
        }

        return MaintenanceRequest::create($validated);
    }

    public function update(Request $request, $id)
    {
        $maintenance = MaintenanceRequest::findOrFail($id);
        $maintenance->update($request->only([
            'student_id',
            'title',
            'description',
            'urgency',
            'status',
            'room_number',
        ]));
        return $maintenance;
    }

    public function destroy($id)
    {
        MaintenanceRequest::destroy($id);
        return response()->noContent();
    }
}