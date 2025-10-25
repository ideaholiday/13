<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VRTour extends Model
{
    protected $table = 'vr_tours';
    
    //
    protected $fillable = [
        'hotel_id',
        'scenes',
    ];

    protected $casts = [
        'scenes' => 'array',
    ];

    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }
}
