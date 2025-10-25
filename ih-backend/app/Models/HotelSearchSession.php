<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HotelSearchSession extends Model
{
    protected $fillable = [
        'trace_id',
        'token_id',
        'city_id',
        'check_in',
        'check_out',
        'guest_nationality',
        'currency',
        'rooms',
        'search_params',
        'search_results',
        'status',
        'expires_at'
    ];

    protected $casts = [
        'check_in' => 'date',
        'check_out' => 'date',
        'rooms' => 'array',
        'search_params' => 'array',
        'search_results' => 'array',
        'expires_at' => 'datetime',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function prebooks(): HasMany
    {
        return $this->hasMany(HotelPrebook::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
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
