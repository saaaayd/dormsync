<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'student_id',
        'amount',
        'type',
        'status',
        'due_date',
        'paid_date',
        'notes',
        'receipt_drive_id',
        'receipt_url',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}