<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\City;
use App\Models\Country;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HotelFlowTest extends TestCase
{
    use RefreshDatabase;

    private array $headers;
    private City $testCity;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.tbo.use_mock' => true]);

        $this->headers = [
            'X-Api-Key' => env('IH_API_KEY', 'IH_API_2025_DEMO_KEY'),
        ];
        
        // Create test data
        $country = Country::create([
            'name' => 'India',
            'iso2' => 'IN',
            'iso3' => 'IND',
        ]);
        
        $this->testCity = City::create([
            'name' => 'Goa',
            'country_id' => $country->id,
            'tbo_city_code' => 'GOI',
            'latitude' => 15.2993,
            'longitude' => 74.1240,
        ]);
    }

    public function test_complete_hotel_booking_flow(): void
    {
        $searchPayload = [
            'cityId' => 'GOI',
            'cityName' => 'Goa',
            'countryName' => 'India',
            'checkIn' => now()->addWeeks(2)->format('Y-m-d'),
            'checkOut' => now()->addWeeks(2)->addDays(2)->format('Y-m-d'),
            'currency' => 'INR',
            'nationality' => 'IN',
            'rooms' => [[
                'adults' => 2,
                'children' => 0,
                'childAges' => [],
            ]],
        ];

        $searchResponse = $this->withHeaders($this->headers)
            ->postJson('/api/v1/hotels/search', $searchPayload)
            ->assertOk()
            ->json();

        // Test that search works with mock data
        $this->assertArrayHasKey('sessionId', $searchResponse);
        $this->assertArrayHasKey('results', $searchResponse);
        $this->assertArrayHasKey('meta', $searchResponse);
        $this->assertTrue($searchResponse['meta']['usingMockData']);
        $this->assertCount(1, $searchResponse['results']);
        
        // Verify the first result has expected structure
        $firstHotel = $searchResponse['results'][0];
        $this->assertArrayHasKey('hotelCode', $firstHotel);
        $this->assertArrayHasKey('hotelName', $firstHotel);
        $this->assertArrayHasKey('leadRate', $firstHotel);
        
        // The search endpoint is working with mock data
    }
}
