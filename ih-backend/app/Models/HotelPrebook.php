<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelPrebook extends Model
{
    protected $fillable = [
        'booking_code',
        'search_session_id',
        'hotel_id',
        'room_id',
        'payload',
        'verified_total',
        'taxes',
        'policies',
        'constraints',
        'status',
        'expires_at'
    ];

    protected $casts = [
        'payload' => 'array',
        'policies' => 'array',
        'constraints' => 'array',
        'verified_total' => 'decimal:2',
        'taxes' => 'decimal:2',
        'expires_at' => 'datetime',
    ];

    public function searchSession(): BelongsTo
    {
        return $this->belongsTo(HotelSearchSession::class);
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(HotelRoom::class);
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }

    public function isExpired(): bool
    {
        return $this->expires_at < now();
    }
}
