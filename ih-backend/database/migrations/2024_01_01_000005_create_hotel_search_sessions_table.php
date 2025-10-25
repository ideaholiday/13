<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_search_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('trace_id', 100)->unique();
            $table->string('token_id', 100)->nullable();
            $table->foreignId('city_id')->nullable()->constrained()->onDelete('set null');
            $table->date('check_in');
            $table->date('check_out');
            $table->string('guest_nationality', 2)->default('IN');
            $table->string('currency', 3)->default('INR');
            $table->json('rooms'); // [{adults: 2, children: 1, childAges: [5]}]
            $table->json('search_params')->nullable();
            $table->json('search_results')->nullable();
            $table->enum('status', ['active', 'expired', 'completed'])->default('active');
            $table->timestamp('expires_at');
            $table->timestamps();
            
            $table->index(['trace_id', 'status']);
            $table->index(['city_id', 'check_in', 'check_out']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_search_sessions');
    }
};
