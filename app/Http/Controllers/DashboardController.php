<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\MaintenanceRequest;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $totalStudents = User::where('role', 'student')->count();
        $pendingMaintenance = MaintenanceRequest::where('status', '!=', 'resolved')->count();
        $pendingCleaning = 0; // extend later if needed
        $overduePayments = Payment::where('status', 'overdue')->count();

        $urgentMaintenance = MaintenanceRequest::with('student')
            ->where('urgency', 'high')
            ->where('status', '!=', 'resolved')
            ->latest()
            ->take(5)
            ->get();

        $recentAnnouncements = Announcement::latest()->take(5)->get();

        return response()->json([
            'stats' => [
                'totalStudents' => $totalStudents,
                'pendingMaintenance' => $pendingMaintenance,
                'pendingCleaning' => $pendingCleaning,
                'overduePayments' => $overduePayments,
            ],
            'urgentMaintenance' => $urgentMaintenance,
            'recentAnnouncements' => $recentAnnouncements,
        ]);
    }
}
