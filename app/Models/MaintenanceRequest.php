<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenanceRequest extends Model
{
    protected $fillable = [
        'student_id',
        'title',
        'description',
        'urgency',
        'status',
        'room_number',
        'attachment_drive_id',
        'attachment_url',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}