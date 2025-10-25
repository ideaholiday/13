<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Country extends Model
{
    protected $fillable = [
        'iso2',
        'name',
    ];

    /**
     * Get the cities for the country.
     */
    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }

    /**
     * Scope for searching countries by name prefix.
     */
    public function scopeSearchByName($query, string $search)
    {
        return $query->where('name', 'LIKE', $search . '%');
    }
}