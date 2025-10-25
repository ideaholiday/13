<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Hotel extends Model
{
    protected $fillable = [
        'city_id',
        'tbo_hotel_code',
        'name',
        'description',
        'star_rating',
        'latitude',
        'longitude',
        'address',
        'phone',
        'email',
        'website',
        'thumb_image',
        'images',
        'amenities',
        'facilities',
        'guest_rating',
        'review_count',
        'is_active',
    ];

    protected $casts = [
        'amenities' => 'array',
        'facilities' => 'array',
        'images' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'guest_rating' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the city that owns the hotel.
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Scope for searching hotels by name prefix.
     */
    public function scopeSearchByName($query, string $search)
    {
        return $query->where('name', 'LIKE', $search . '%');
    }
}