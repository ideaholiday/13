<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelRoom extends Model
{
    protected $fillable = [
        'hotel_id',
        'tbo_room_id',
        'name',
        'description',
        'meal_type',
        'is_refundable',
        'occupancy',
        'amenities',
        'images',
        'size_sqm',
        'bed_type',
        'is_active'
    ];

    protected $casts = [
        'occupancy' => 'array',
        'amenities' => 'array',
        'images' => 'array',
        'is_refundable' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByMealType($query, $mealType)
    {
        return $query->where('meal_type', $mealType);
    }

    public function scopeRefundable($query)
    {
        return $query->where('is_refundable', true);
    }
}
