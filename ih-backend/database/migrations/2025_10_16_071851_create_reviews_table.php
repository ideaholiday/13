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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('bookable_type'); // e.g., Hotel, Flight, Package
            $table->unsignedBigInteger('bookable_id');
            $table->tinyInteger('rating'); // 1-5
            $table->string('title');
            $table->text('content');
            $table->json('photos')->nullable();
            $table->boolean('verified')->default(false);
            $table->integer('helpful_count')->default(0);
            $table->timestamps();
            $table->index(['bookable_type', 'bookable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
