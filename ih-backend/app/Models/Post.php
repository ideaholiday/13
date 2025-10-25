<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'body',
        'cover_image',
        'status',
        'is_featured',
        'reading_minutes',
        'seo_title',
        'seo_description',
        'og_image',
        'publish_at',
        'author_id',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'reading_minutes' => 'integer',
            'publish_at' => 'datetime',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)->withTimestamps();
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }

    public function destinations(): BelongsToMany
    {
        return $this->belongsToMany(Destination::class)->withTimestamps();
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function scopePublishScope(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->where(function (Builder $scopeQuery) {
                $scopeQuery->whereNull('publish_at')
                    ->orWhere('publish_at', '<=', now());
            });
    }

    protected static function booted(): void
    {
        static::saved(function (self $post): void {
            if ($post->status === 'published') {
                \App\Services\RevalidateService::trigger([
                    '/blog/' . ltrim($post->slug, '/'),
                ]);
            }
        });
    }
}
