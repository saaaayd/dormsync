<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    // GET: /api/payments (Get all payments)
    public function index()
    {
        // In a real app, you'd filter this by the logged-in user if they are a student
        return Payment::with('student')->latest()->get();
    }

    // POST: /api/payments (Create a payment)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'amount' => 'required|numeric',
            'type' => 'required|string',
            'due_date' => 'required|date',
        ]);

        return Payment::create($validated);
    }

    // DELETE: /api/payments/{id} (Delete a payment)
    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);
        $payment->delete();
        return response()->json(['message' => 'Payment deleted']);
    }
}