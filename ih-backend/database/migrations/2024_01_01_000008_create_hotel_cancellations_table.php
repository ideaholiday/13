<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_cancellations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->string('change_request_id', 100)->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('pending');
            $table->decimal('charge', 12, 2)->default(0);
            $table->decimal('refund_amount', 12, 2)->default(0);
            $table->json('cancellation_policy')->nullable();
            $table->text('reason')->nullable();
            $table->timestamp('requested_at');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            
            $table->index(['booking_id', 'status']);
            $table->index('change_request_id');
            $table->index('requested_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_cancellations');
    }
};
