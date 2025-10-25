<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'package_id',
        'package_title',
        'travel_date',
        'travelers',
        'message',
        'status',
        'assigned_to',
        'notes'
    ];

    protected $casts = [
        'travel_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}
