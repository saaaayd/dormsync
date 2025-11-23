<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        // Allow filtering by date
        $date = $request->query('date', now()->toDateString());
        return AttendanceLog::with('student')->whereDate('date', $date)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'status' => 'required|in:present,absent,late',
            'date' => 'required|date',
            'check_in' => 'nullable',
            'check_out' => 'nullable',
        ]);

        return AttendanceLog::create($validated);
    }

    public function update(Request $request, $id)
    {
        $log = AttendanceLog::findOrFail($id);
        $log->update($request->all());
        return $log;
    }
}