<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'user_id', 'bookable_type', 'bookable_id',
        'rating', 'title', 'content', 'photos',
        'verified', 'helpful_count'
    ];

    protected $casts = [
        'photos' => 'array',
        'verified' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bookable()
    {
        return $this->morphTo();
    }
}
