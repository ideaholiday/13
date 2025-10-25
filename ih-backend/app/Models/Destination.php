<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Destination extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'country_code',
        'state',
        'lat',
        'lng',
        'summary',
        'hero_image',
        'seo_title',
        'seo_description',
        'og_image',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class)->withTimestamps();
    }

    protected static function booted(): void
    {
        static::saved(function (self $destination): void {
            \App\Services\RevalidateService::trigger([
                '/destinations/' . ltrim($destination->slug, '/'),
            ]);
        });
    }
}
