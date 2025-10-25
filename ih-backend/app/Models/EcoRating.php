<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EcoRating extends Model
{
    //
    protected $fillable = [
        'ratable_type',
        'ratable_id',
        'score',
        'certifications',
        'features',
    ];

    protected $casts = [
        'certifications' => 'array',
        'features' => 'array',
    ];

    public function ratable()
    {
        return $this->morphTo();
    }
}
