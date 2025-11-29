<?php

namespace App\Services;

use App\Models\CleaningSchedule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Spatie\GoogleCalendar\Event;

class GoogleCalendarService
{
    private bool $enabled;

    public function __construct()
    {
        $this->enabled = (bool) config('google-calendar.calendar_id');
    }

    public function createForSchedule(CleaningSchedule $schedule): ?string
    {
        return $this->execute(function () use ($schedule) {
            $event = new Event();
            $event->name = sprintf('Cleaning: %s', $schedule->area);
            $event->startDateTime = $this->startAt($schedule);
            $event->endDateTime = $this->endAt($schedule);
            $event->description = sprintf('Assigned to %s', $schedule->assigned_to);
            $event->save();

            return $event->id;
        });
    }

    public function updateForSchedule(CleaningSchedule $schedule): void
    {
        $this->execute(function () use ($schedule) {
            if (!$schedule->calendar_event_id) {
                $schedule->update([
                    'calendar_event_id' => $this->createForSchedule($schedule),
                ]);

                return;
            }

            $event = Event::find($schedule->calendar_event_id);

            if (!$event) {
                $schedule->update([
                    'calendar_event_id' => $this->createForSchedule($schedule),
                ]);

                return;
            }

            $event->name = sprintf('Cleaning: %s', $schedule->area);
            $event->startDateTime = $this->startAt($schedule);
            $event->endDateTime = $this->endAt($schedule);
            $event->description = sprintf(
                "Assigned to %s\nStatus: %s",
                $schedule->assigned_to,
                ucfirst($schedule->status)
            );
            $event->save();
        });
    }

    public function delete(string $eventId): void
    {
        $this->execute(function () use ($eventId) {
            $event = Event::find($eventId);
            if ($event) {
                $event->delete();
            }
        });
    }

    private function execute(callable $callback): mixed
    {
        if (!$this->enabled) {
            return null;
        }

        try {
            return $callback();
        } catch (\Throwable $exception) {
            Log::warning('Google Calendar operation failed', [
                'message' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    private function startAt(CleaningSchedule $schedule): Carbon
    {
        return Carbon::parse($schedule->scheduled_date)->setTime(9, 0);
    }

    private function endAt(CleaningSchedule $schedule): Carbon
    {
        return Carbon::parse($schedule->scheduled_date)->setTime(10, 0);
    }
}

