<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->query('date', now()->toDateString());
        return AttendanceLog::with('student')->whereDate('date', $date)->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'student_identifier' => 'required|string',
            'timestamp' => 'nullable|date',
        ]);

        $student = User::where('student_id', $data['student_identifier'])
            ->orWhere('id', $data['student_identifier'])
            ->orWhere('email', $data['student_identifier'])
            ->firstOrFail();

        $timestamp = Carbon::parse($data['timestamp'] ?? now());
        $date = $timestamp->toDateString();

        $log = AttendanceLog::firstOrNew([
            'student_id' => $student->id,
            'date' => $date,
        ]);

        if (!$log->exists) {
            $log->fill([
                'check_in' => $timestamp->toTimeString(),
                'status' => 'present',
            ]);
            $log->save();

            return response()->json([
                'action' => 'check_in',
                'log' => $log->load('student'),
            ]);
        }

        if (!$log->check_out) {
            $log->update([
                'check_out' => $timestamp->toTimeString(),
                'status' => 'present',
            ]);

            return response()->json([
                'action' => 'check_out',
                'log' => $log->load('student'),
            ]);
        }

        return response()->json([
            'action' => 'completed',
            'log' => $log->load('student'),
        ]);
    }

    public function update(Request $request, $id)
    {
        $log = AttendanceLog::findOrFail($id);

        $validated = $request->validate([
            'status' => 'nullable|in:present,absent,late',
            'check_in' => 'nullable',
            'check_out' => 'nullable',
        ]);

        $log->update($validated);

        return $log->load('student');
    }
}