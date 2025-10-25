<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelCancellation extends Model
{
    protected $fillable = [
        'booking_id',
        'change_request_id',
        'status',
        'charge',
        'refund_amount',
        'cancellation_policy',
        'reason',
        'requested_at',
        'processed_at'
    ];

    protected $casts = [
        'cancellation_policy' => 'array',
        'charge' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'requested_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
