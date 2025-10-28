<?php
/**
 * Test TBO API with live authentication through proxy tunnel
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\TBO\AirService;
use App\Services\TBO\HotelService;
use App\Services\TBO\SoapClient12;

echo "=== Testing Live TBO API ===\n\n";

// Test Flight API
echo "1. Testing Flight API Authentication...\n";
try {
    $client = new SoapClient12();
    $airService = new AirService($client);
    
    // Test authentication via REST
    $config = config('services.tbo');
    echo "   Proxy: " . ($config['tbo_proxy'] ?? 'not set') . "\n";
    echo "   Use Mock: " . ($config['use_mock'] ? 'true' : 'false') . "\n";
    
    // Create a simple test request
    $payload = [
        'segments' => [[
            'origin' => 'DEL',
            'destination' => 'BOM',
            'departureDate' => now()->addDays(30)->format('Y-m-d\T00:00:00'),
        ]],
        'tripType' => 'O',
        'adults' => 1,
        'children' => 0,
        'infants' => 0,
        'cabinClass' => 'E',
    ];
    
    echo "   Searching flights (DEL -> BOM)...\n";
    $result = $airService->search($payload);
    
    if (isset($result['Response']['Results']) || isset($result['results'])) {
        echo "   ✅ Flight search SUCCESS!\n";
        $results = $result['results'] ?? $result['Response']['Results'] ?? [];
        echo "   Results count: " . count($results) . "\n";
    } else {
        echo "   ⚠️  Flight search returned no results\n";
        echo "   Response status: " . (isset($result['Response']['ResponseStatus']) ? $result['Response']['ResponseStatus'] : 'unknown') . "\n";
    }
} catch (Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}

echo "\n2. Testing Hotel API Authentication...\n";
try {
    $hotelService = new HotelService();
    
    if ($config['use_mock']) {
        echo "   Using MOCK data\n";
    } else {
        echo "   Authenticating with TBO...\n";
        $token = $hotelService->authenticate();
        echo "   ✅ Authentication SUCCESS!\n";
        echo "   Token: " . substr($token, 0, 20) . "...\n";
    }
} catch (Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
echo "\nStatus: ";
$config = config('services.tbo');
if (!$config['use_mock'] && $config['tbo_proxy']) {
    echo "✅ Using LIVE API through proxy tunnel\n";
} else {
    echo "⚠️  Check configuration\n";
}
