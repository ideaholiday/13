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
        Schema::create('eco_ratings', function (Blueprint $table) {
            $table->id();
            $table->string('ratable_type'); // e.g. hotel, flight
            $table->unsignedBigInteger('ratable_id');
            $table->unsignedTinyInteger('score'); // 1-5 eco rating
            $table->json('certifications')->nullable(); // e.g. Green Key, LEED
            $table->json('features')->nullable(); // e.g. solar, recycling, etc
            $table->timestamps();
            $table->index(['ratable_type', 'ratable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eco_ratings');
    }
};
