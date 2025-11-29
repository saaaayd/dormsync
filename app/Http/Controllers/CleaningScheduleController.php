<?php

namespace App\Http\Controllers;

use App\Models\CleaningSchedule;
use App\Services\GoogleCalendarService;
use Illuminate\Http\Request;

class CleaningScheduleController extends Controller
{
    public function __construct(private readonly GoogleCalendarService $calendar)
    {
    }

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
            'notes' => 'nullable|string',
        ]);

        $schedule = CleaningSchedule::create($validated);
        $eventId = $this->calendar->createForSchedule($schedule);

        if ($eventId) {
            $schedule->update(['calendar_event_id' => $eventId]);
        }

        return $schedule;
    }

    public function update(Request $request, $id)
    {
        $task = CleaningSchedule::findOrFail($id);
        $validated = $request->validate([
            'area' => 'sometimes|string',
            'assigned_to' => 'sometimes|string',
            'scheduled_date' => 'sometimes|date',
            'status' => 'sometimes|in:pending,completed',
            'notes' => 'nullable|string',
        ]);

        $task->update($validated);
        $this->calendar->updateForSchedule($task);

        return $task;
    }
    
    public function destroy($id)
    {
        $task = CleaningSchedule::findOrFail($id);
        if ($task->calendar_event_id) {
            $this->calendar->delete($task->calendar_event_id);
        }
        $task->delete();

        return response()->noContent();
    }
}