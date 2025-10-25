<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->constrained()->onDelete('cascade');
            $table->string('tbo_hotel_code', 20)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('star_rating')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('thumb_image')->nullable();
            $table->json('images')->nullable();
            $table->json('amenities')->nullable();
            $table->json('facilities')->nullable();
            $table->decimal('guest_rating', 3, 2)->nullable();
            $table->integer('review_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['city_id', 'is_active']);
            $table->index('tbo_hotel_code');
            $table->index(['star_rating', 'is_active']);
            $table->index(['guest_rating', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};
