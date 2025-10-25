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
        Schema::create('carbon_emissions', function (Blueprint $table) {
            $table->id();
            $table->string('flight_id')->unique();
            $table->string('route'); // e.g., "DEL-DXB"
            $table->decimal('co2_kg', 8, 2); // CO2 in kg
            $table->decimal('trees_equivalent', 8, 2); // Tree equivalents
            $table->decimal('offset_price', 8, 2); // Price to offset in USD/INR
            $table->string('currency', 3)->default('INR');
            $table->timestamps();
            
            $table->index('route');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carbon_emissions');
    }
};
