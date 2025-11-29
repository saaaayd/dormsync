<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;

class StudentIdGenerator
{
    public function next(): string
    {
        $year = Carbon::now()->format('Y');

        $latest = User::whereNotNull('student_id')
            ->where('student_id', 'like', "{$year}-%")
            ->orderByDesc('student_id')
            ->value('student_id');

        $sequence = 0;
        if ($latest) {
            $parts = explode('-', $latest);
            $sequence = isset($parts[1]) ? (int) $parts[1] : 0;
        }

        $sequence++;

        return sprintf('%s-%03d', $year, $sequence);
    }
}

