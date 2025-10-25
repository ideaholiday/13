<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'webhook_id',
        'event_type',
        'entity_type',
        'provider',
        'raw_payload',
        'status',
        'processed_at',
        'response_data',
        'error_message',
    ];

    protected $casts = [
        'raw_payload' => 'array',
        'response_data' => 'array',
        'processed_at' => 'datetime',
    ];

    /**
     * Get the booking associated with this webhook log
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'webhook_id', 'payment_id');
    }

    /**
     * Scope for processed webhooks
     */
    public function scopeProcessed($query)
    {
        return $query->where('status', 'processed');
    }

    /**
     * Scope for failed webhooks
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope for processing webhooks
     */
    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    /**
     * Scope by provider
     */
    public function scopeByProvider($query, string $provider)
    {
        return $query->where('provider', $provider);
    }

    /**
     * Scope by event type
     */
    public function scopeByEventType($query, string $eventType)
    {
        return $query->where('event_type', $eventType);
    }
}