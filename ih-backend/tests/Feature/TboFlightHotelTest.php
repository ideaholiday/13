<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\Fluent\AssertableJson;
use Tests\TestCase;

class TboFlightHotelTest extends TestCase
{
    private array $headers;

    protected function setUp(): void
    {
        parent::setUp();

        // Override mock settings for live API testing when enabled
        if (env('USE_TBO_FLIGHT') && !env('USE_MOCK')) {
            config(['services.tbo.use_mock' => false]);
            config(['services.tbo.enable_flight_api' => true]);
        }

        if (env('USE_TBO_HOTEL') && !env('USE_MOCK')) {
            config(['services.tbo.use_mock' => false]);
            config(['services.tbo.enable_hotel_api' => true]);
        }

        $this->headers = [
            'X-Api-Key' => env('IH_API_KEY', 'IH_API_2025_DEMO_KEY'),
        ];
    }

    public function test_returns_live_flight_results_from_tbo(): void
    {
        if (env('USE_MOCK', true)) {
            $this->markTestSkipped('Test requires live TBO API (set USE_MOCK=false)');
        }

        $payload = [
            'origin' => 'DEL',
            'destination' => 'BOM',
            'departDate' => env('TEST_DEPART_DATE', '2025-11-20'),
            'tripType' => 'O',
            'adults' => 1,
            'children' => 0,
            'infants' => 0,
            'cabinClass' => 'E',
        ];

        $response = $this->withHeaders($this->headers)
            ->postJson('/api/v1/flights/search', $payload);

        $response->assertOk()
            ->assertJson(fn (AssertableJson $j) =>
                $j->where('success', true)
                  ->has('data.Response.Results')
                  ->has('SessionId')
            );

        $data = $response->json();
        $this->assertIsArray($data['data']['Response']['Results']);
        $this->assertGreaterThan(0, count($data['data']['Response']['Results']));
    }

    public function test_returns_live_hotel_results_from_tbo(): void
    {
        if (!env('USE_TBO_HOTEL') || env('USE_MOCK', true)) {
            $this->markTestSkipped('Test requires live TBO Hotel API');
        }

        $payload = [
            'cityId' => env('TEST_CITY_ID', 115936),
            'checkIn' => env('TEST_CHECKIN', '2025-11-20'),
            'nights' => 1,
            'rooms' => [['adults' => 2, 'children' => 0, 'childAges' => []]],
        ];

        $response = $this->withHeaders($this->headers)
            ->postJson('/api/v1/hotels/search', $payload);

        $response->assertOk()
            ->assertJson(fn (AssertableJson $j) =>
                $j->hasAny(['HotelResult', 'HotelSearchResult', 'Results'])
            );
    }

    public function test_fare_rules_endpoint(): void
    {
        if (env('USE_MOCK', true)) {
            $this->markTestSkipped('Test requires live TBO API');
        }

        // First, get a flight result
        $searchPayload = [
            'origin' => 'DEL',
            'destination' => 'BOM',
            'departDate' => env('TEST_DEPART_DATE', '2025-11-20'),
            'tripType' => 'O',
            'adults' => 1,
            'children' => 0,
            'infants' => 0,
            'cabinClass' => 'E',
        ];

        $searchResponse = $this->withHeaders($this->headers)
            ->postJson('/api/v1/flights/search', $searchPayload)
            ->assertOk()
            ->json();

        $sessionId = $searchResponse['SessionId'];
        $resultIndex = $searchResponse['data']['Response']['Results'][0][0]['ResultIndex'];

        // Test fare rules
        $fareRulePayload = [
            'sessionId' => $sessionId,
            'resultIndex' => $resultIndex,
        ];

        $response = $this->withHeaders($this->headers)
            ->postJson('/api/v1/flights/fare-rule', $fareRulePayload);

        $response->assertOk()
            ->assertJson(fn (AssertableJson $j) =>
                $j->has('success')
                  ->has('data')
            );
    }

    public function test_fare_quote_endpoint(): void
    {
        if (env('USE_MOCK', true)) {
            $this->markTestSkipped('Test requires live TBO API');
        }

        // First, get a flight result
        $searchPayload = [
            'origin' => 'DEL',
            'destination' => 'BOM',
            'departDate' => env('TEST_DEPART_DATE', '2025-11-20'),
            'tripType' => 'O',
            'adults' => 1,
            'children' => 0,
            'infants' => 0,
            'cabinClass' => 'E',
        ];

        $searchResponse = $this->withHeaders($this->headers)
            ->postJson('/api/v1/flights/search', $searchPayload)
            ->assertOk()
            ->json();

        $sessionId = $searchResponse['SessionId'];
        $resultIndex = $searchResponse['data']['Response']['Results'][0][0]['ResultIndex'];

        // Test fare quote
        $fareQuotePayload = [
            'sessionId' => $sessionId,
            'resultIndex' => $resultIndex,
        ];

        $response = $this->withHeaders($this->headers)
            ->postJson('/api/v1/flights/fare-quote', $fareQuotePayload);

        $response->assertOk()
            ->assertJson(fn (AssertableJson $j) =>
                $j->has('success')
                  ->has('data')
            );
    }

    public function test_ssr_baggage_meals_endpoint(): void
    {
        if (env('USE_MOCK', true)) {
            $this->markTestSkipped('Test requires live TBO API');
        }

        // First, get a flight result
        $searchPayload = [
            'origin' => 'DEL',
            'destination' => 'BOM',
            'departDate' => env('TEST_DEPART_DATE', '2025-11-20'),
            'tripType' => 'O',
            'adults' => 1,
            'children' => 0,
            'infants' => 0,
            'cabinClass' => 'E',
        ];

        $searchResponse = $this->withHeaders($this->headers)
            ->postJson('/api/v1/flights/search', $searchPayload)
            ->assertOk()
            ->json();

        $sessionId = $searchResponse['SessionId'];
        $resultIndex = $searchResponse['data']['Response']['Results'][0][0]['ResultIndex'];

        // Test SSR
        $ssrPayload = [
            'sessionId' => $sessionId,
            'resultIndex' => $resultIndex,
        ];

        $response = $this->withHeaders($this->headers)
            ->postJson('/api/v1/flights/ssr', $ssrPayload);

        $response->assertOk()
            ->assertJson(fn (AssertableJson $j) =>
                $j->has('success')
            );
    }

    public function test_calendar_fare_endpoint(): void
    {
        if (env('USE_MOCK', true)) {
            $this->markTestSkipped('Test requires live TBO API');
        }

        $payload = [
            'origin' => 'DEL',
            'destination' => 'BOM',
            'departDate' => env('TEST_DEPART_DATE', '2025-11-20'),
            'tripType' => 'O',
            'adults' => 1,
            'children' => 0,
            'infants' => 0,
            'cabinClass' => 'E',
        ];

        $response = $this->withHeaders($this->headers)
            ->postJson('/api/v1/flights/calendar-fare', $payload);

        $response->assertOk()
            ->assertJson(fn (AssertableJson $j) =>
                $j->has('success')
            );
    }

    public function test_booking_details_endpoint(): void
    {
        // This test uses mock data as we don't want to create real bookings
        $this->markTestSkipped('Requires existing booking - skip for automated tests');
    }
}
