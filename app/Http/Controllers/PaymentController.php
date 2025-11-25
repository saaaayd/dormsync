<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
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
            'status' => 'required|in:paid,pending,overdue',
            'notes' => 'nullable|string',
        ]);

        if ($validated['status'] === 'paid') {
            $validated['paid_date'] = now();
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
            'payments.*.status' => 'required|in:paid,pending,overdue',
            'payments.*.notes' => 'nullable|string',
        ]);

        $created = [];

        DB::transaction(function () use ($validated, &$created) {
            foreach ($validated['payments'] as $paymentData) {
                if ($paymentData['status'] === 'paid') {
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
            'status' => 'sometimes|in:paid,pending,overdue',
            'notes' => 'nullable|string',
        ]);

        if (array_key_exists('status', $validated)) {
            $validated['paid_date'] = $validated['status'] === 'paid' ? now() : null;
        }

        $payment->update($validated);

        return $payment->load('student');
    }

    public function destroy($id)
    {
        Payment::destroy($id);
        return response()->noContent();
    }
}