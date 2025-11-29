<?php

namespace App\Http\Controllers;

use App\Mail\PaymentVerified;
use App\Models\Payment;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class PaymentController extends Controller
{
    public function __construct(private readonly GoogleDriveService $driveService)
    {
    }

    public function index(Request $request)
    {
        $query = Payment::with('student')->latest();

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->query('student_id'));
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'amount' => 'required|numeric',
            'type' => 'required|string',
            'due_date' => 'required|date',
            'status' => 'required|in:paid,pending,overdue,verified',
            'notes' => 'nullable|string',
            'receipt_image' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        if (in_array($validated['status'], ['paid', 'verified'], true)) {
            $validated['paid_date'] = now();
        }

        if ($request->hasFile('receipt_image')) {
            $upload = $this->uploadReceipt($request->file('receipt_image'));
            $validated['receipt_drive_id'] = $upload['id'];
            $validated['receipt_url'] = $upload['url'];
        }

        return Payment::create($validated)->load('student');
    }

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'payments' => 'required|array|min:1',
            'payments.*.student_id' => 'required|exists:users,id',
            'payments.*.amount' => 'required|numeric',
            'payments.*.type' => 'required|string',
            'payments.*.due_date' => 'required|date',
            'payments.*.status' => 'required|in:paid,pending,overdue,verified',
            'payments.*.notes' => 'nullable|string',
        ]);

        $created = [];

        DB::transaction(function () use ($validated, &$created) {
            foreach ($validated['payments'] as $paymentData) {
                if (in_array($paymentData['status'], ['paid', 'verified'], true)) {
                    $paymentData['paid_date'] = now();
                }
                $created[] = Payment::create($paymentData)->load('student');
            }
        });

        return response()->json($created, 201);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);

        $validated = $request->validate([
            'student_id' => 'sometimes|exists:users,id',
            'amount' => 'sometimes|numeric',
            'type' => 'sometimes|string',
            'due_date' => 'sometimes|date',
            'status' => 'sometimes|in:paid,pending,overdue,verified',
            'notes' => 'nullable|string',
            'receipt_image' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        if (array_key_exists('status', $validated)) {
            $validated['paid_date'] = in_array($validated['status'], ['paid', 'verified'], true) ? now() : null;
        }

        if ($request->hasFile('receipt_image')) {
            $upload = $this->uploadReceipt($request->file('receipt_image'));
            $validated['receipt_drive_id'] = $upload['id'];
            $validated['receipt_url'] = $upload['url'];
        }

        $wasVerified = $payment->status === 'verified';
        $payment->update($validated);

        $payment->refresh();

        if (($validated['status'] ?? null) === 'verified' && !$wasVerified && $payment->student) {
            Mail::to($payment->student->email)->queue(new PaymentVerified($payment));
        }

        return $payment->load('student');
    }

    public function destroy($id)
    {
        Payment::destroy($id);
        return response()->noContent();
    }

    private function uploadReceipt(UploadedFile $file): array
    {
        try {
            return $this->driveService->upload($file, 'payment');
        } catch (\Throwable $exception) {
            report($exception);
            abort(422, 'Unable to upload receipt to Google Drive.');
        }
    }
}
