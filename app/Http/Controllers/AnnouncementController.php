<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index()
    {
        return Announcement::with('creator')->latest()->get();
    }

    public function store(Request $request)
    {
        return Announcement::create([
            'title' => $request->title,
            'content' => $request->content,
            'priority' => $request->priority,
            'created_by' => $request->user()->id
        ]);
    }

    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->update($request->all());
        return $announcement;
    }

    public function destroy($id)
    {
        Announcement::destroy($id);
        return response()->noContent();
    }
}