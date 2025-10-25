<?php

namespace App\Console\Commands;

use App\Models\Country;
use App\Models\City;
use App\Models\Hotel;
use App\Services\TboStaticService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TboSyncCommand extends Command
{
    protected $signature = 'tbo:sync {countryCode=IN}';
    protected $description = 'Sync TBO static data (countries, cities, hotels) into the database';

    public function handle()
    {
        $countryCode = $this->argument('countryCode');
        
        $this->info("Starting TBO sync for country: {$countryCode}");
        
        try {
            // Check if TBO credentials are configured
            if (!config('services.tbo.basic_user') || !config('services.tbo.basic_pass')) {
                $this->warn('TBO credentials not configured. Using mock data for testing.');
                $this->syncMockData($countryCode);
                return 0;
            }
            
            $tboService = new TboStaticService();
            
            // Sync countries
            $this->syncCountries($tboService);
            
            // Sync cities for the specified country
            $this->syncCities($tboService, $countryCode);
            
            // Sync hotels for all cities in the country
            $this->syncHotels($tboService, $countryCode);
            
            $this->info('TBO sync completed successfully!');
            
        } catch (\Exception $e) {
            $this->error('TBO sync failed: ' . $e->getMessage());
            Log::error('TBO sync failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return 1;
        }
        
        return 0;
    }
    
    private function syncCountries(TboStaticService $tboService)
    {
        $this->info('Syncing countries...');
        
        $countries = $tboService->getCountryList();
        
        if (!is_array($countries)) {
            $this->warn('No countries data received from TBO');
            return;
        }
        
        $count = 0;
        foreach ($countries as $countryData) {
            if (!isset($countryData['CountryCode']) || !isset($countryData['CountryName'])) {
                continue;
            }
            
            Country::updateOrCreate(
                ['iso2' => $countryData['CountryCode']],
                ['name' => $countryData['CountryName']]
            );
            $count++;
        }
        
        $this->info("Synced {$count} countries");
    }
    
    private function syncCities(TboStaticService $tboService, string $countryCode)
    {
        $this->info("Syncing cities for country: {$countryCode}");
        
        $country = Country::where('iso2', $countryCode)->first();
        if (!$country) {
            $this->error("Country {$countryCode} not found in database");
            return;
        }
        
        $cities = $tboService->getCityList($countryCode);
        
        if (!is_array($cities)) {
            $this->warn('No cities data received from TBO');
            return;
        }
        
        $count = 0;
        foreach ($cities as $cityData) {
            if (!isset($cityData['CityCode']) || !isset($cityData['CityName'])) {
                continue;
            }
            
            City::updateOrCreate(
                ['tbo_city_code' => $cityData['CityCode']],
                [
                    'country_id' => $country->id,
                    'name' => $cityData['CityName']
                ]
            );
            $count++;
        }
        
        $this->info("Synced {$count} cities for {$countryCode}");
    }
    
    private function syncHotels(TboStaticService $tboService, string $countryCode)
    {
        $this->info("Syncing hotels for country: {$countryCode}");
        
        $cities = City::whereHas('country', function($query) use ($countryCode) {
            $query->where('iso2', $countryCode);
        })->get();
        
        $totalHotels = 0;
        
        foreach ($cities as $city) {
            $this->info("Syncing hotels for city: {$city->name} ({$city->tbo_city_code})");
            
            try {
                $hotels = $tboService->getHotelList($city->tbo_city_code);
                
                if (!is_array($hotels)) {
                    $this->warn("No hotels data received for city {$city->name}");
                    continue;
                }
                
                $count = 0;
                foreach ($hotels as $hotelData) {
                    if (!isset($hotelData['HotelCode']) || !isset($hotelData['HotelName'])) {
                        continue;
                    }
                    
                    Hotel::updateOrCreate(
                        ['tbo_hotel_code' => $hotelData['HotelCode']],
                        [
                            'city_id' => $city->id,
                            'name' => $hotelData['HotelName'],
                            'description' => $hotelData['Description'] ?? null,
                            'star_rating' => $hotelData['StarRating'] ?? null,
                            'latitude' => $hotelData['Latitude'] ?? null,
                            'longitude' => $hotelData['Longitude'] ?? null,
                            'amenities' => isset($hotelData['Amenities']) ? json_encode($hotelData['Amenities']) : null,
                            'is_active' => true
                        ]
                    );
                    $count++;
                }
                
                $this->info("Synced {$count} hotels for {$city->name}");
                $totalHotels += $count;
                
            } catch (\Exception $e) {
                $this->warn("Failed to sync hotels for city {$city->name}: " . $e->getMessage());
                Log::warning("Failed to sync hotels for city {$city->name}", ['error' => $e->getMessage()]);
            }
        }
        
        $this->info("Total hotels synced: {$totalHotels}");
    }
    
    private function syncMockData(string $countryCode)
    {
        $this->info('Syncing mock data for testing...');
        
        // Sync mock countries
        $mockCountries = [
            ['CountryCode' => 'IN', 'CountryName' => 'India'],
            ['CountryCode' => 'AE', 'CountryName' => 'United Arab Emirates'],
            ['CountryCode' => 'TH', 'CountryName' => 'Thailand'],
            ['CountryCode' => 'SG', 'CountryName' => 'Singapore'],
        ];
        
        foreach ($mockCountries as $countryData) {
            Country::updateOrCreate(
                ['iso2' => $countryData['CountryCode']],
                ['name' => $countryData['CountryName']]
            );
        }
        
        $this->info('Synced ' . count($mockCountries) . ' mock countries');
        
        // Sync mock cities for India
        if ($countryCode === 'IN') {
            $mockCities = [
                ['CityCode' => 'DEL', 'CityName' => 'Delhi'],
                ['CityCode' => 'BOM', 'CityName' => 'Mumbai'],
                ['CityCode' => 'BLR', 'CityName' => 'Bangalore'],
                ['CityCode' => 'CCU', 'CityName' => 'Kolkata'],
                ['CityCode' => 'HYD', 'CityName' => 'Hyderabad'],
                ['CityCode' => 'MAA', 'CityName' => 'Chennai'],
                ['CityCode' => 'AMD', 'CityName' => 'Ahmedabad'],
                ['CityCode' => 'PNQ', 'CityName' => 'Pune'],
            ];
            
            $country = Country::where('iso2', 'IN')->first();
            if ($country) {
                foreach ($mockCities as $cityData) {
                    City::updateOrCreate(
                        ['tbo_city_code' => $cityData['CityCode']],
                        [
                            'country_id' => $country->id,
                            'name' => $cityData['CityName']
                        ]
                    );
                }
                $this->info('Synced ' . count($mockCities) . ' mock cities for India');
            }
        }
        
        // Sync mock hotels for Delhi
        $delhiCity = City::where('tbo_city_code', 'DEL')->first();
        if ($delhiCity) {
            $mockHotels = [
                ['HotelCode' => 'TBO001', 'HotelName' => 'The Oberoi New Delhi', 'Description' => 'Luxury hotel in the heart of Delhi'],
                ['HotelCode' => 'TBO002', 'HotelName' => 'Taj Palace New Delhi', 'Description' => 'Iconic luxury hotel with heritage charm'],
                ['HotelCode' => 'TBO003', 'HotelName' => 'ITC Maurya New Delhi', 'Description' => 'Business luxury hotel with modern amenities'],
                ['HotelCode' => 'TBO004', 'HotelName' => 'Le Meridien New Delhi', 'Description' => 'Contemporary hotel with excellent location'],
                ['HotelCode' => 'TBO005', 'HotelName' => 'The Leela Palace New Delhi', 'Description' => 'Palatial luxury hotel with royal treatment'],
            ];
            
            foreach ($mockHotels as $hotelData) {
                Hotel::updateOrCreate(
                    ['tbo_hotel_code' => $hotelData['HotelCode']],
                    [
                        'city_id' => $delhiCity->id,
                        'name' => $hotelData['HotelName'],
                        'short_desc' => $hotelData['Description'],
                        'star_rating' => 5,
                        'amenities' => json_encode(['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'])
                    ]
                );
            }
            $this->info('Synced ' . count($mockHotels) . ' mock hotels for Delhi');
        }
        
        $this->info('Mock data sync completed successfully!');
    }
}