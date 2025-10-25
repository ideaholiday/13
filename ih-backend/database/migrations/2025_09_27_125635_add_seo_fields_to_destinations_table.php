<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            $table->string('seo_title')->nullable()->after('hero_image');
            $table->text('seo_description')->nullable()->after('seo_title');
            $table->string('og_image')->nullable()->after('seo_description');
        });
    }

    public function down(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            $table->dropColumn(['seo_title', 'seo_description', 'og_image']);
        });
    }
};
