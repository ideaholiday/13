<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'gateway')) {
                $table->string('gateway')->default('razorpay')->after('booking_id');
            }
            if (!Schema::hasColumn('payments', 'order_id')) {
                $table->string('order_id')->nullable()->after('gateway');
            }
            if (!Schema::hasColumn('payments', 'payment_id')) {
                $table->string('payment_id')->nullable()->after('order_id');
            }
        });

        if (Schema::hasColumn('payments', 'razorpay_order_id')) {
            DB::table('payments')
                ->whereNotNull('razorpay_order_id')
                ->update([
                    'order_id' => DB::raw('COALESCE(order_id, razorpay_order_id)'),
                ]);
        }

        if (Schema::hasColumn('payments', 'razorpay_payment_id')) {
            DB::table('payments')
                ->whereNotNull('razorpay_payment_id')
                ->update([
                    'payment_id' => DB::raw('COALESCE(payment_id, razorpay_payment_id)'),
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'payment_id')) {
                $table->dropColumn('payment_id');
            }
            if (Schema::hasColumn('payments', 'order_id')) {
                $table->dropColumn('order_id');
            }
            if (Schema::hasColumn('payments', 'gateway')) {
                $table->dropColumn('gateway');
            }
        });
    }
};
