<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'offer_id')) {
                $table->string('offer_id')->nullable()->after('currency');
            }
            if (!Schema::hasColumn('bookings', 'meta')) {
                $table->json('meta')->nullable()->after('offer_id');
            }
            if (!Schema::hasColumn('bookings', 'contact_email')) {
                $table->string('contact_email')->nullable()->after('razorpay_order_id');
            }
            if (!Schema::hasColumn('bookings', 'contact_phone')) {
                $table->string('contact_phone')->nullable()->after('contact_email');
            }
        });

        Schema::table('passengers', function (Blueprint $table) {
            if (!Schema::hasColumn('passengers', 'type')) {
                $table->string('type', 8)->default('ADT')->after('booking_id');
            }
            if (!Schema::hasColumn('passengers', 'title')) {
                $table->string('title', 8)->nullable()->after('type');
            }
            if (!Schema::hasColumn('passengers', 'dob')) {
                $table->date('dob')->nullable()->after('last_name');
            }
            if (!Schema::hasColumn('passengers', 'meta')) {
                $table->json('meta')->nullable()->after('passport_expiry');
            }
        });
    }

    public function down(): void
    {
        Schema::table('passengers', function (Blueprint $table) {
            if (Schema::hasColumn('passengers', 'meta')) {
                $table->dropColumn('meta');
            }
            if (Schema::hasColumn('passengers', 'dob')) {
                $table->dropColumn('dob');
            }
            if (Schema::hasColumn('passengers', 'title')) {
                $table->dropColumn('title');
            }
            if (Schema::hasColumn('passengers', 'type')) {
                $table->dropColumn('type');
            }
        });

        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'contact_phone')) {
                $table->dropColumn('contact_phone');
            }
            if (Schema::hasColumn('bookings', 'contact_email')) {
                $table->dropColumn('contact_email');
            }
            if (Schema::hasColumn('bookings', 'meta')) {
                $table->dropColumn('meta');
            }
            if (Schema::hasColumn('bookings', 'offer_id')) {
                $table->dropColumn('offer_id');
            }
        });
    }
};
