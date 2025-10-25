<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_prebooks', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code', 100)->unique();
            $table->foreignId('search_session_id')->nullable()->constrained('hotel_search_sessions')->onDelete('set null');
            $table->foreignId('hotel_id')->constrained()->onDelete('cascade');
            $table->foreignId('room_id')->nullable()->constrained('hotel_rooms')->onDelete('set null');
            $table->json('payload'); // Original TBO prebook response
            $table->decimal('verified_total', 12, 2);
            $table->decimal('taxes', 12, 2)->default(0);
            $table->json('policies')->nullable(); // Cancellation, refund policies
            $table->json('constraints')->nullable(); // PAN/passport requirements
            $table->enum('status', ['pending', 'verified', 'expired'])->default('pending');
            $table->timestamp('expires_at');
            $table->timestamps();
            
            $table->index(['booking_code', 'status']);
            $table->index(['hotel_id', 'status']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_prebooks');
    }
};
