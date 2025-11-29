<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\User;
use App\Notifications\UrgentAnnouncementNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class AnnouncementController extends Controller
{
    public function index()
    {
        return Announcement::with('creator')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:normal,important,urgent',
        ]);

        // In the current mock-auth setup there is no authenticated user,
        // so we attach the announcement to the first available user
        // (typically the admin account). This avoids NOT NULL constraint errors.
        $creatorId = User::query()->value('id');
        if (!$creatorId) {
            return response()->json([
                'message' => 'No users exist to attach as announcement creator.',
            ], 422);
        }
        $validated['created_by'] = $creatorId;

        $announcement = Announcement::create($validated);

        if ($announcement->priority === 'urgent') {
            $targets = User::whereHas('pushSubscriptions')->get();
            if ($targets->isNotEmpty()) {
                Notification::send($targets, new UrgentAnnouncementNotification($announcement));
            }
        }

        return $announcement;
    }

    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->update($request->only([
            'title',
            'content',
            'priority',
        ]));
        return $announcement;
    }

    public function destroy($id)
    {
        Announcement::destroy($id);
        return response()->noContent();
    }
}