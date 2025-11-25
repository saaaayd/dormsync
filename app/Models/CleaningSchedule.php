<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CleaningSchedule extends Model
{
    protected $fillable = [
        'area',
        'assigned_to',
        'scheduled_date',
        'status',
        'notes',
    ];
}
