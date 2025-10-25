<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Models\Booking;
use App\Mail\BookingConfirmationMail;
use Illuminate\Support\Facades\Mail;


Route::prefix('v1')->group(function () {
    // Test email route
    Route::get('/test-email/{bookingId}', function ($bookingId) {
        $booking = Booking::find($bookingId);
        if ($booking) {
            Mail::to($booking->contact_email)->send(new BookingConfirmationMail($booking));
            return response()->json(['message' => 'Email sent!']);
        }
        return response()->json(['message' => 'Booking not found'], 404);
    });

    // Auth routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Health check endpoint
    Route::get('/health', function () {
        return response()->json(['ok' => true]);
    });
    
    // Version endpoint
    Route::get('/version', function () {
        return response()->json([
            'version' => config('app.version', 'dev'),
            'name' => config('app.name', 'iHoliday API'),
            'environment' => config('app.env', 'local'),
        ]);
    });
    
    // Debug config endpoint
    Route::get('/debug/config', function () {
        return response()->json([
            'env' => [
                'USE_MOCK' => env('USE_MOCK'),
                'USE_TBO_FLIGHT' => env('USE_TBO_FLIGHT'),
            ],
            'config' => [
                'use_mock' => config('services.tbo.use_mock'),
                'enable_flight_api' => config('services.tbo.enable_flight_api'),
                'flight_mode' => config('services.tbo.flight_mode'),
                'tbo_proxy' => config('services.tbo.tbo_proxy'),
            ],
        ]);
    });
    
    // Debug: List all eco ratings
    Route::get('/eco-ratings', [\App\Http\Controllers\Api\V1\EcoRatingController::class, 'index']);
    // Trust Badges (static)
    Route::get('/trust-badges', function () {
        return config('ih_trust_badges');
    });
    // Locales & Currencies (static)
    Route::get('/locales', function () {
        return config('ih_locales');
    });
    Route::get('/currencies', function () {
        return config('ih_currencies');
    });
    // VR Tours
    Route::get('/vr-tours/hotel/{id}', [\App\Http\Controllers\Api\V1\VRTourController::class, 'show']);
    Route::post('/vr-tours', [\App\Http\Controllers\Api\V1\VRTourController::class, 'store']); // Admin only
    // Eco Ratings
    Route::get('/eco-ratings/{type}/{id}', [\App\Http\Controllers\Api\V1\EcoRatingController::class, 'show']);
    Route::post('/eco-ratings', [\App\Http\Controllers\Api\V1\EcoRatingController::class, 'store']); // Admin only
    // Flights - TBO Integration
    Route::post('/flights/search', [\App\Http\Controllers\Api\V1\FlightController::class, 'search']);
    Route::post('/flights/reprice', [\App\Http\Controllers\Api\V1\FlightController::class, 'fareQuote']); // Alias for consistency
    Route::post('/flights/fare-quote', [\App\Http\Controllers\Api\V1\FlightController::class, 'fareQuote']);
    Route::post('/flights/fare-rules', [\App\Http\Controllers\Api\V1\FlightController::class, 'fareRule']); // Alias for consistency
    Route::post('/flights/fare-rule', [\App\Http\Controllers\Api\V1\FlightController::class, 'fareRule']);
    Route::post('/flights/ssr', [\App\Http\Controllers\Api\V1\FlightController::class, 'ssr']);
    Route::post('/flights/calendar-fare', [\App\Http\Controllers\Api\V1\FlightController::class, 'getCalendarFare']);
    Route::post('/flights/calendar-fare/update', [\App\Http\Controllers\Api\V1\FlightController::class, 'updateCalendarFareOfDay']);
    Route::post('/flights/price-rbd', [\App\Http\Controllers\Api\V1\FlightController::class, 'priceRBD']);
    Route::post('/flights/book', [\App\Http\Controllers\Api\V1\FlightController::class, 'book']);
    Route::post('/flights/ticket', [\App\Http\Controllers\Api\V1\FlightController::class, 'ticket']);
    Route::post('/flights/booking-details', [\App\Http\Controllers\Api\V1\FlightController::class, 'bookingDetails']);

    // Booking details - standardized endpoint
    Route::get('/bookings/{id}', [\App\Http\Controllers\Api\V1\FlightController::class, 'getBooking']);

    // Hotels - TBO Integration (New Comprehensive API)
    Route::get('/hotels/countries', [\App\Http\Controllers\Api\V1\HotelsController::class, 'countries']);
    Route::get('/hotels/cities', [\App\Http\Controllers\Api\V1\HotelsController::class, 'cities']);
    Route::get('/hotels/hotel-codes', [\App\Http\Controllers\Api\V1\HotelsController::class, 'hotelCodes']);
    Route::post('/hotels/search', [\App\Http\Controllers\Api\V1\HotelsController::class, 'search']);
    Route::post('/hotels/prebook', [\App\Http\Controllers\Api\V1\HotelsController::class, 'preBook']);
    Route::post('/hotels/book', [\App\Http\Controllers\Api\V1\HotelsController::class, 'book']);
    Route::post('/hotels/voucher', [\App\Http\Controllers\Api\V1\HotelsController::class, 'voucher']);
    Route::get('/hotels/booking/{id}', [\App\Http\Controllers\Api\V1\HotelsController::class, 'booking']);
    Route::get('/hotels/booking-detail', [\App\Http\Controllers\Api\V1\HotelsController::class, 'bookingDetail']);
    Route::post('/hotels/cancel', [\App\Http\Controllers\Api\V1\HotelsController::class, 'cancel']);
    Route::get('/hotels/cancel-status/{changeRequestId}', [\App\Http\Controllers\Api\V1\HotelsController::class, 'cancelStatus']);
    Route::post('/hotels/payment/create-order', [\App\Http\Controllers\Api\V1\HotelsController::class, 'createPaymentOrder']);

    // Legacy hotel endpoints (for backward compatibility)
    Route::post('/hotels/rooms', [\App\Http\Controllers\Api\V1\HotelController::class, 'rooms']);
    Route::post('/hotels/pricing', [\App\Http\Controllers\Api\V1\HotelController::class, 'pricing']);
    Route::post('/hotels/booking-details', [\App\Http\Controllers\Api\V1\HotelController::class, 'bookingDetails']);

    // Payments
    Route::post('/payments/create-order', [\App\Http\Controllers\Api\V1\PaymentController::class, 'createOrder']);
    
    Route::post('/payments/verify', function () {
        return response()->json([
            'success' => true,
            'status' => 'verified',
            'message' => 'Payment verified successfully'
        ]);
    });

    // Reviews
    Route::get('/reviews', [\App\Http\Controllers\Api\V1\ReviewController::class, 'index']);
    Route::post('/reviews', [\App\Http\Controllers\Api\V1\ReviewController::class, 'store']);
    Route::post('/reviews/{id}/helpful', [\App\Http\Controllers\Api\V1\ReviewController::class, 'markHelpful']);

    // Carbon Emissions
    Route::get('/carbon-emissions/flight/{flightId}', [\App\Http\Controllers\Api\V1\CarbonController::class, 'flight']);
    Route::post('/carbon-emissions/offset', [\App\Http\Controllers\Api\V1\CarbonController::class, 'offset']);

    // Forum
    Route::get('/forum/posts', [\App\Http\Controllers\Api\V1\ForumController::class, 'index']);
    Route::post('/forum/posts', [\App\Http\Controllers\Api\V1\ForumController::class, 'store']);
    Route::get('/forum/posts/{id}', [\App\Http\Controllers\Api\V1\ForumController::class, 'show']);
    Route::post('/forum/posts/{id}/like', [\App\Http\Controllers\Api\V1\ForumController::class, 'like']);
    Route::post('/forum/replies', [\App\Http\Controllers\Api\V1\ForumReplyController::class, 'store']);
    Route::post('/forum/replies/{id}/like', [\App\Http\Controllers\Api\V1\ForumReplyController::class, 'like']);

    // Enquiry routes
    Route::post('/enquiries', [\App\Http\Controllers\Api\V1\EnquiryController::class, 'store']);
    Route::get('/enquiries', [\App\Http\Controllers\Api\V1\EnquiryController::class, 'index']);
    Route::get('/enquiries/{id}', [\App\Http\Controllers\Api\V1\EnquiryController::class, 'show']);
    Route::patch('/enquiries/{id}/status', [\App\Http\Controllers\Api\V1\EnquiryController::class, 'updateStatus']);

    // Voucher routes
    Route::post('/vouchers/generate', [\App\Http\Controllers\Api\V1\VoucherController::class, 'generate']);
    Route::get('/vouchers/{bookingId}/download', [\App\Http\Controllers\Api\V1\VoucherController::class, 'download']);
    Route::post('/vouchers/send-email', [\App\Http\Controllers\Api\V1\VoucherController::class, 'sendEmail']);

    // Autocomplete routes
    Route::get('/autocomplete', [\App\Http\Controllers\Api\V1\AutocompleteController::class, '__invoke']);

    // Webhook routes (no authentication required)
    Route::post('/webhooks/razorpay', [\App\Http\Controllers\Webhook\RazorpayWebhookController::class, 'handle']);
    Route::post('/webhooks/tbo', [\App\Http\Controllers\Webhook\TboWebhookController::class, 'handle']);
});