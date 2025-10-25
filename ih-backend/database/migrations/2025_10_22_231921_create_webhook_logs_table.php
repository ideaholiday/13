<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('webhook_logs', function (Blueprint $table) {
            $table->id();
            $table->string('webhook_id')->index(); // Unique identifier for the webhook event
            $table->string('event_type'); // Type of event (e.g., payment.captured, booking.confirmed)
            $table->string('entity_type')->nullable(); // Type of entity (payment, booking, etc.)
            $table->string('provider'); // Provider name (razorpay, tbo, etc.)
            $table->json('raw_payload'); // Raw webhook payload
            $table->enum('status', ['processing', 'processed', 'failed'])->default('processing');
            $table->timestamp('processed_at')->nullable();
            $table->json('response_data')->nullable(); // Response data after processing
            $table->text('error_message')->nullable(); // Error message if processing failed
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['webhook_id', 'event_type']);
            $table->index(['provider', 'status']);
            $table->index('processed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhook_logs');
    }
};
