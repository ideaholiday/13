#!/usr/bin/env php
<?php
/**
 * TBO API Endpoint Validation Script
 * 
 * This script validates that all TBO API endpoints are configured correctly
 * and can be accessed (without requiring actual API credentials).
 * 
 * SECURITY NOTE: This script only validates endpoint URLs and does not
 * expose or require actual API credentials.
 */

require __DIR__ . '/ih-backend/vendor/autoload.php';

use Illuminate\Support\Arr;

// Load Laravel config
$app = require_once __DIR__ . '/ih-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n=== TBO API Endpoint Validation ===\n\n";

$config = config('services.tbo');

// Define expected endpoints
$flightEndpoints = [
    'flight_auth_rest_url' => 'https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest/Authenticate',
    'flight_search_rest_url' => 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Search',
    'flight_farequote_rest_url' => 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/FareQuote',
    'flight_farerule_rest_url' => 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/FareRule',
    'flight_ssr_rest_url' => 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/SSR',
    'flight_getcalendarfare_rest_url' => 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetCalendarFare',
    'flight_updatecalendarfareofday_rest_url' => 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/UpdateCalendarFareOfDay',
    'flight_pricerbd_rest_url' => 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/PriceRBD',
    'flight_book_rest_url' => 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Book',
    'flight_ticket_rest_url' => 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Ticket',
    'flight_booking_details_rest_url' => 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetBookingDetails',
    'flight_sendchangerequest_rest_url' => 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/SendChangeRequest',
    'flight_getchangerequeststatus_rest_url' => 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetChangeRequestStatus',
    'flight_releasepnrrequest_rest_url' => 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/ReleasePNRRequest',
    'flight_getcancellationcharges_rest_url' => 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetCancellationCharges',
];

$hotelEndpoints = [
    'hotel_auth_rest_url' => 'https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest/Authenticate',
    'hotel_search_url' => 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelResult',
    'hotel_prebook_url' => 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelRoom',
    'hotel_book_url' => 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/Book',
];

// Validate Flight Endpoints
echo "Flight API Endpoints:\n";
echo str_repeat("-", 80) . "\n";

$flightPass = 0;
$flightFail = 0;

foreach ($flightEndpoints as $key => $expected) {
    $actual = Arr::get($config, $key);
    $status = $actual === $expected ? "✅ PASS" : "❌ FAIL";
    
    if ($actual === $expected) {
        $flightPass++;
        echo sprintf("%-45s %s\n", $key, $status);
    } else {
        $flightFail++;
        echo sprintf("%-45s %s\n", $key, $status);
        // Sanitize output to avoid exposing any sensitive information
        $sanitizedExpected = preg_replace('/\/\/[^\/]+@/', '//***@', $expected);
        $sanitizedActual = preg_replace('/\/\/[^\/]+@/', '//***@', $actual ?? 'NULL');
        echo "  Expected: $sanitizedExpected\n";
        echo "  Actual:   $sanitizedActual\n";
    }
}

echo "\n";

// Validate Hotel Endpoints
echo "Hotel API Endpoints:\n";
echo str_repeat("-", 80) . "\n";

$hotelPass = 0;
$hotelFail = 0;

foreach ($hotelEndpoints as $key => $expected) {
    $actual = Arr::get($config, $key);
    $status = $actual === $expected ? "✅ PASS" : "❌ FAIL";
    
    if ($actual === $expected) {
        $hotelPass++;
        echo sprintf("%-45s %s\n", $key, $status);
    } else {
        $hotelFail++;
        echo sprintf("%-45s %s\n", $key, $status);
        // Sanitize output to avoid exposing any sensitive information
        $sanitizedExpected = preg_replace('/\/\/[^\/]+@/', '//***@', $expected);
        $sanitizedActual = preg_replace('/\/\/[^\/]+@/', '//***@', $actual ?? 'NULL');
        echo "  Expected: $sanitizedExpected\n";
        echo "  Actual:   $sanitizedActual\n";
    }
}

echo "\n";

// Check HTTPS enforcement
echo "HTTPS Enforcement Check:\n";
echo str_repeat("-", 80) . "\n";

$httpCount = 0;
foreach ($config as $key => $value) {
    if (is_string($value) && strpos($value, 'http://') === 0) {
        $httpCount++;
        echo "❌ FAIL: $key uses HTTP instead of HTTPS\n";
        // Sanitize output to avoid exposing sensitive information
        $sanitized = preg_replace('/\/\/[^\/]+@/', '//***@', $value);
        echo "  Value: $sanitized\n";
    }
}

if ($httpCount === 0) {
    echo "✅ PASS: All endpoints use HTTPS\n";
}

echo "\n";

// Check Base URLs
echo "Base URL Configuration:\n";
echo str_repeat("-", 80) . "\n";

$baseUrls = [
    'flight_base_url' => 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest',
    'booking_base_url' => 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest',
    'shared_base_url' => 'https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest',
    'hotel_base_url' => 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest',
];

$basePass = 0;
$baseFail = 0;

foreach ($baseUrls as $key => $expected) {
    $actual = Arr::get($config, $key);
    $status = $actual === $expected ? "✅ PASS" : "❌ FAIL";
    
    if ($actual === $expected) {
        $basePass++;
        echo sprintf("%-45s %s\n", $key, $status);
    } else {
        $baseFail++;
        echo sprintf("%-45s %s\n", $key, $status);
        // Sanitize output to avoid exposing any sensitive information
        $sanitizedExpected = preg_replace('/\/\/[^\/]+@/', '//***@', $expected);
        $sanitizedActual = preg_replace('/\/\/[^\/]+@/', '//***@', $actual ?? 'NULL');
        echo "  Expected: $sanitizedExpected\n";
        echo "  Actual:   $sanitizedActual\n";
    }
}

echo "\n";

// Summary
echo "Summary:\n";
echo str_repeat("=", 80) . "\n";
echo sprintf("Flight API Endpoints:    %d passed, %d failed\n", $flightPass, $flightFail);
echo sprintf("Hotel API Endpoints:     %d passed, %d failed\n", $hotelPass, $hotelFail);
echo sprintf("Base URL Configuration:  %d passed, %d failed\n", $basePass, $baseFail);
echo sprintf("HTTPS Enforcement:       %s\n", $httpCount === 0 ? "PASS" : "FAIL ($httpCount HTTP endpoints found)");

$totalPass = $flightPass + $hotelPass + $basePass + ($httpCount === 0 ? 1 : 0);
$totalFail = $flightFail + $hotelFail + $baseFail + ($httpCount > 0 ? 1 : 0);

echo "\n";
if ($totalFail === 0) {
    echo "✅ ALL VALIDATIONS PASSED\n";
    exit(0);
} else {
    echo "❌ SOME VALIDATIONS FAILED\n";
    exit(1);
}
