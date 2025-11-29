<?php

namespace App\Http\Controllers;

use App\Mail\NewMaintenanceRequest;
use App\Models\MaintenanceRequest;
use App\Models\User;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;

class MaintenanceRequestController extends Controller
{
    public function __construct(private readonly GoogleDriveService $driveService)
    {
    }

    public function index(Request $request)
    {
        $query = MaintenanceRequest::with('student')->latest();

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->query('student_id'));
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'urgency' => 'required|in:low,medium,high',
            'room_number' => 'nullable|string',
            'status' => 'nullable|in:pending,in-progress,resolved',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
        ]);

        $student = User::with('studentProfile')->findOrFail($validated['student_id']);

        if (empty($validated['room_number'])) {
            $validated['room_number'] = $student->studentProfile->room_number ?? 'N/A';
        }

        if (empty($validated['status'])) {
            $validated['status'] = 'pending';
        }

        if ($request->hasFile('attachment')) {
            $upload = $this->uploadAttachment($request->file('attachment'));
            $validated['attachment_drive_id'] = $upload['id'];
            $validated['attachment_url'] = $upload['url'];
        }

        $record = MaintenanceRequest::create($validated)->load('student');

        $adminEmails = User::where('role', 'admin')->pluck('email')->filter()->all();
        if ($adminEmails) {
            Mail::to($adminEmails)->queue(new NewMaintenanceRequest($record));
        }

        return $record;
    }

    public function update(Request $request, $id)
    {
        $maintenance = MaintenanceRequest::findOrFail($id);

        $validated = $request->validate([
            'student_id' => 'sometimes|exists:users,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'urgency' => 'sometimes|in:low,medium,high',
            'status' => 'sometimes|in:pending,in-progress,resolved',
            'room_number' => 'nullable|string',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
        ]);

        if ($request->hasFile('attachment')) {
            $upload = $this->uploadAttachment($request->file('attachment'));
            $validated['attachment_drive_id'] = $upload['id'];
            $validated['attachment_url'] = $upload['url'];
        }

        $maintenance->update($validated);

        return $maintenance->load('student');
    }

    public function destroy($id)
    {
        MaintenanceRequest::destroy($id);
        return response()->noContent();
    }

    private function uploadAttachment(UploadedFile $file): array
    {
        try {
            return $this->driveService->upload($file, 'maintenance');
        } catch (\Throwable $exception) {
            report($exception);
            abort(422, 'Unable to upload maintenance attachment.');
        }
    }
}
