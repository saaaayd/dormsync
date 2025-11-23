<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceRequest;
use Illuminate\Http\Request;

class MaintenanceRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = MaintenanceRequest::with('student');
        
        // If logged in user is a student, only show their requests
        if ($request->user()->role === 'student') {
            $query->where('student_id', $request->user()->id);
        }

        return $query->latest()->get();
    }

    public function store(Request $request)
    {
        return MaintenanceRequest::create([
            'student_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'urgency' => $request->urgency,
            'room_number' => $request->user()->studentProfile->room_number ?? 'N/A',
            'status' => 'pending'
        ]);
    }

    public function update(Request $request, $id)
    {
        $maintenance = MaintenanceRequest::findOrFail($id);
        $maintenance->update($request->all());
        return $maintenance;
    }

    public function destroy($id)
    {
        MaintenanceRequest::destroy($id);
        return response()->noContent();
    }
}