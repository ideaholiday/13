<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasFactory;

    public const TYPE_FLIGHT = 'flight';
    public const TYPE_HOTEL = 'hotel';

    public const STATUS_PENDING = 'pending';
    public const STATUS_ON_HOLD = 'on_hold';
    public const STATUS_PAID = 'paid';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_FAILED = 'failed';

    public const PAYMENT_STATUS_UNPAID = 'unpaid';
    public const PAYMENT_STATUS_PAID = 'paid';
    public const PAYMENT_STATUS_FAILED = 'failed';

    protected $fillable = [
        'type',
        'status',
        'pnr',
        'booking_id_ext',
        'confirmation_no',
        'hotel_id',
        'room_snapshot',
        'guest_json',
        'total_price',
        'currency',
        'offer_id',
        'meta',
        'payment_status',
        'razorpay_order_id',
        'razorpay_payment_id',
        'contact_email',
        'contact_phone',
        'is_vouchered',
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
        'meta' => 'array',
        'room_snapshot' => 'array',
        'guest_json' => 'array',
        'is_vouchered' => 'boolean',
    ];

    protected $attributes = [
        'status' => self::STATUS_ON_HOLD,
        'payment_status' => self::PAYMENT_STATUS_UNPAID,
        'is_vouchered' => false,
    ];

    public function passengers(): HasMany
    {
        return $this->hasMany(Passenger::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function cancellations(): HasMany
    {
        return $this->hasMany(HotelCancellation::class);
    }

    public function scopeFlight($query)
    {
        return $query->where('type', self::TYPE_FLIGHT);
    }

    public function scopeHotel($query)
    {
        return $query->where('type', self::TYPE_HOTEL);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED);
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', self::PAYMENT_STATUS_PAID);
    }
}
