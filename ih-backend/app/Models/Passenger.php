<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Passenger extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'type',
        'title',
        'first_name',
        'last_name',
        'dob',
        'gender',
        'passport_number',
        'passport_country',
        'passport_expiry',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
        'dob' => 'date',
        'passport_expiry' => 'date',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
