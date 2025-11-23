<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index()
    {
        return Payment::with('student')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'amount' => 'required|numeric',
            'type' => 'required|string',
            'due_date' => 'required|date',
            'status' => 'required|in:paid,pending,overdue',
        ]);

        if ($validated['status'] === 'paid') {
            $validated['paid_date'] = now();
        }

        return Payment::create($validated);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        $payment->update($request->all());
        return $payment;
    }

    public function destroy($id)
    {
        Payment::destroy($id);
        return response()->noContent();
    }
}