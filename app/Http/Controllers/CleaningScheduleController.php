<?php

namespace App\Http\Controllers;

use App\Models\CleaningSchedule;
use Illuminate\Http\Request;

class CleaningScheduleController extends Controller
{
    public function index()
    {
        return CleaningSchedule::orderBy('scheduled_date')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'area' => 'required|string',
            'assigned_to' => 'required|string',
            'scheduled_date' => 'required|date',
            'status' => 'required|in:pending,completed',
        ]);

        return CleaningSchedule::create($validated);
    }

    public function update(Request $request, $id)
    {
        $task = CleaningSchedule::findOrFail($id);
        $task->update($request->all());
        return $task;
    }
    
    public function destroy($id)
    {
        CleaningSchedule::destroy($id);
        return response()->noContent();
    }
}