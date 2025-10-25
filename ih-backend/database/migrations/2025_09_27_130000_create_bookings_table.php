<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->string('status')->default('pending');
            $table->string('pnr')->nullable();
            $table->decimal('total_price', 10, 2)->default(0);
            $table->string('currency', 3)->default('INR');
            $table->string('offer_id')->nullable();
            $table->json('meta')->nullable();
            $table->string('payment_status')->default('unpaid');
            $table->string('razorpay_order_id')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->timestamps();
            $table->index(['type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
