<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained()->onDelete('cascade');
            $table->string('tbo_room_id', 50)->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('meal_type', 20)->nullable(); // BB, HB, FB, AI
            $table->boolean('is_refundable')->default(false);
            $table->json('occupancy')->nullable(); // {adults: 2, children: 1, maxOccupancy: 3}
            $table->json('amenities')->nullable();
            $table->json('images')->nullable();
            $table->decimal('size_sqm', 8, 2)->nullable();
            $table->string('bed_type', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['hotel_id', 'is_active']);
            $table->index('tbo_room_id');
            $table->index(['meal_type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_rooms');
    }
};
