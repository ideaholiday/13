<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarbonEmission extends Model
{
    protected $fillable = [
        'flight_id',
        'route',
        'co2_kg',
        'trees_equivalent',
        'offset_price',
        'currency',
    ];

    protected $casts = [
        'co2_kg' => 'decimal:2',
        'trees_equivalent' => 'decimal:2',
        'offset_price' => 'decimal:2',
    ];
}
