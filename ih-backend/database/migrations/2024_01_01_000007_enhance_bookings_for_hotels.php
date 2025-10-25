<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Add hotel-specific fields
            $table->string('booking_id_ext', 100)->nullable()->after('pnr'); // TBO BookingId
            $table->string('confirmation_no', 100)->nullable()->after('booking_id_ext'); // TBO ConfirmationNo
            $table->foreignId('hotel_id')->nullable()->constrained()->onDelete('set null')->after('confirmation_no');
            $table->json('room_snapshot')->nullable()->after('hotel_id'); // Room details at booking time
            $table->json('guest_json')->nullable()->after('room_snapshot'); // Guest information
            $table->boolean('is_vouchered')->default(false)->after('guest_json');
            $table->string('razorpay_payment_id')->nullable()->after('razorpay_order_id');
            
            // Add indexes
            $table->index(['booking_id_ext', 'type']);
            $table->index(['confirmation_no', 'type']);
            $table->index(['hotel_id', 'status']);
            $table->index('is_vouchered');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['hotel_id']);
            $table->dropIndex(['booking_id_ext', 'type']);
            $table->dropIndex(['confirmation_no', 'type']);
            $table->dropIndex(['hotel_id', 'status']);
            $table->dropIndex('is_vouchered');
            
            $table->dropColumn([
                'booking_id_ext',
                'confirmation_no', 
                'hotel_id',
                'room_snapshot',
                'guest_json',
                'is_vouchered',
                'razorpay_payment_id'
            ]);
        });
    }
};
