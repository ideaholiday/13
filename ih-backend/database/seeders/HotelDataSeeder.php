<?php

namespace Database\Seeders;

use App\Models\Country;
use App\Models\City;
use App\Models\Hotel;
use App\Models\HotelRoom;
use Illuminate\Database\Seeder;

class HotelDataSeeder extends Seeder
{
    public function run(): void
    {
        // Seed countries
        $countries = [
            ['iso2' => 'AE', 'iso3' => 'ARE', 'name' => 'United Arab Emirates', 'tbo_country_code' => 'AE'],
            ['iso2' => 'IN', 'iso3' => 'IND', 'name' => 'India', 'tbo_country_code' => 'IN'],
            ['iso2' => 'TH', 'iso3' => 'THA', 'name' => 'Thailand', 'tbo_country_code' => 'TH'],
            ['iso2' => 'SG', 'iso3' => 'SGP', 'name' => 'Singapore', 'tbo_country_code' => 'SG'],
            ['iso2' => 'MY', 'iso3' => 'MYS', 'name' => 'Malaysia', 'tbo_country_code' => 'MY'],
            ['iso2' => 'ID', 'iso3' => 'IDN', 'name' => 'Indonesia', 'tbo_country_code' => 'ID'],
            ['iso2' => 'FR', 'iso3' => 'FRA', 'name' => 'France', 'tbo_country_code' => 'FR'],
            ['iso2' => 'IT', 'iso3' => 'ITA', 'name' => 'Italy', 'tbo_country_code' => 'IT'],
            ['iso2' => 'ES', 'iso3' => 'ESP', 'name' => 'Spain', 'tbo_country_code' => 'ES'],
            ['iso2' => 'US', 'iso3' => 'USA', 'name' => 'United States', 'tbo_country_code' => 'US'],
        ];

        foreach ($countries as $countryData) {
            Country::firstOrCreate(
                ['iso2' => $countryData['iso2']],
                $countryData
            );
        }

        // Seed cities
        $cities = [
            // UAE
            ['country_iso2' => 'AE', 'name' => 'Dubai', 'tbo_city_code' => 'DXB', 'latitude' => 25.2048, 'longitude' => 55.2708],
            ['country_iso2' => 'AE', 'name' => 'Abu Dhabi', 'tbo_city_code' => 'AUH', 'latitude' => 24.4539, 'longitude' => 54.3773],
            
            // India
            ['country_iso2' => 'IN', 'name' => 'Mumbai', 'tbo_city_code' => 'BOM', 'latitude' => 19.0760, 'longitude' => 72.8777],
            ['country_iso2' => 'IN', 'name' => 'Delhi', 'tbo_city_code' => 'DEL', 'latitude' => 28.7041, 'longitude' => 77.1025],
            ['country_iso2' => 'IN', 'name' => 'Bangalore', 'tbo_city_code' => 'BLR', 'latitude' => 12.9716, 'longitude' => 77.5946],
            ['country_iso2' => 'IN', 'name' => 'Goa', 'tbo_city_code' => 'GOI', 'latitude' => 15.2993, 'longitude' => 74.1240],
            
            // Thailand
            ['country_iso2' => 'TH', 'name' => 'Bangkok', 'tbo_city_code' => 'BKK', 'latitude' => 13.7563, 'longitude' => 100.5018],
            ['country_iso2' => 'TH', 'name' => 'Phuket', 'tbo_city_code' => 'HKT', 'latitude' => 7.8804, 'longitude' => 98.3923],
            
            // Singapore
            ['country_iso2' => 'SG', 'name' => 'Singapore', 'tbo_city_code' => 'SIN', 'latitude' => 1.3521, 'longitude' => 103.8198],
            
            // Malaysia
            ['country_iso2' => 'MY', 'name' => 'Kuala Lumpur', 'tbo_city_code' => 'KUL', 'latitude' => 3.1390, 'longitude' => 101.6869],
            
            // Indonesia
            ['country_iso2' => 'ID', 'name' => 'Bali', 'tbo_city_code' => 'DPS', 'latitude' => -8.3405, 'longitude' => 115.0920],
        ];

        foreach ($cities as $cityData) {
            $country = Country::where('iso2', $cityData['country_iso2'])->first();
            if ($country) {
                City::firstOrCreate(
                    ['tbo_city_code' => $cityData['tbo_city_code']],
                    [
                        'country_id' => $country->id,
                        'name' => $cityData['name'],
                        'latitude' => $cityData['latitude'],
                        'longitude' => $cityData['longitude'],
                    ]
                );
            }
        }

        // Seed hotels
        $hotels = [
            // Dubai hotels
            ['city_code' => 'DXB', 'tbo_hotel_code' => 'DXB001', 'name' => 'Burj Al Arab', 'star_rating' => 5, 'guest_rating' => 4.8],
            ['city_code' => 'DXB', 'tbo_hotel_code' => 'DXB002', 'name' => 'Atlantis The Palm', 'star_rating' => 5, 'guest_rating' => 4.6],
            ['city_code' => 'DXB', 'tbo_hotel_code' => 'DXB003', 'name' => 'Jumeirah Beach Hotel', 'star_rating' => 5, 'guest_rating' => 4.5],
            ['city_code' => 'DXB', 'tbo_hotel_code' => 'DXB004', 'name' => 'Dubai Marina Hotel', 'star_rating' => 4, 'guest_rating' => 4.2],
            
            // Mumbai hotels
            ['city_code' => 'BOM', 'tbo_hotel_code' => 'BOM001', 'name' => 'Taj Mahal Palace', 'star_rating' => 5, 'guest_rating' => 4.7],
            ['city_code' => 'BOM', 'tbo_hotel_code' => 'BOM002', 'name' => 'The Oberoi Mumbai', 'star_rating' => 5, 'guest_rating' => 4.6],
            ['city_code' => 'BOM', 'tbo_hotel_code' => 'BOM003', 'name' => 'JW Marriott Mumbai', 'star_rating' => 5, 'guest_rating' => 4.4],
            
            // Bangkok hotels
            ['city_code' => 'BKK', 'tbo_hotel_code' => 'BKK001', 'name' => 'Mandarin Oriental Bangkok', 'star_rating' => 5, 'guest_rating' => 4.8],
            ['city_code' => 'BKK', 'tbo_hotel_code' => 'BKK002', 'name' => 'The Peninsula Bangkok', 'star_rating' => 5, 'guest_rating' => 4.7],
            ['city_code' => 'BKK', 'tbo_hotel_code' => 'BKK003', 'name' => 'Grand Hyatt Bangkok', 'star_rating' => 5, 'guest_rating' => 4.5],
            
            // Singapore hotels
            ['city_code' => 'SIN', 'tbo_hotel_code' => 'SIN001', 'name' => 'Marina Bay Sands', 'star_rating' => 5, 'guest_rating' => 4.6],
            ['city_code' => 'SIN', 'tbo_hotel_code' => 'SIN002', 'name' => 'The Ritz-Carlton Singapore', 'star_rating' => 5, 'guest_rating' => 4.7],
            
            // Bali hotels
            ['city_code' => 'DPS', 'tbo_hotel_code' => 'DPS001', 'name' => 'The St. Regis Bali Resort', 'star_rating' => 5, 'guest_rating' => 4.8],
            ['city_code' => 'DPS', 'tbo_hotel_code' => 'DPS002', 'name' => 'Four Seasons Resort Bali', 'star_rating' => 5, 'guest_rating' => 4.7],
        ];

        foreach ($hotels as $hotelData) {
            $city = City::where('tbo_city_code', $hotelData['city_code'])->first();
            if ($city) {
                $hotel = Hotel::firstOrCreate(
                    ['tbo_hotel_code' => $hotelData['tbo_hotel_code']],
                    [
                        'city_id' => $city->id,
                        'name' => $hotelData['name'],
                        'star_rating' => $hotelData['star_rating'],
                        'guest_rating' => $hotelData['guest_rating'],
                        'description' => 'Luxurious accommodation with world-class amenities',
                        'amenities' => ['wifi', 'pool', 'spa', 'restaurant', 'gym', 'parking'],
                        'facilities' => ['24-hour room service', 'concierge', 'business center', 'airport shuttle'],
                        'review_count' => rand(100, 1000),
                    ]
                );

                // Create rooms for each hotel
                $roomTypes = [
                    ['name' => 'Deluxe Room', 'meal_type' => 'BB', 'is_refundable' => true],
                    ['name' => 'Executive Suite', 'meal_type' => 'HB', 'is_refundable' => true],
                    ['name' => 'Presidential Suite', 'meal_type' => 'FB', 'is_refundable' => false],
                ];

                foreach ($roomTypes as $roomData) {
                    HotelRoom::firstOrCreate(
                        [
                            'hotel_id' => $hotel->id,
                            'name' => $roomData['name'],
                        ],
                        array_merge($roomData, [
                            'tbo_room_id' => $hotel->tbo_hotel_code . '_' . substr($roomData['name'], 0, 3),
                            'description' => 'Spacious room with modern amenities',
                            'occupancy' => ['adults' => 2, 'children' => 2, 'maxOccupancy' => 4],
                            'amenities' => ['wifi', 'minibar', 'safe', 'tv'],
                            'size_sqm' => rand(25, 80),
                            'bed_type' => 'King Bed',
                        ])
                    );
                }
            }
        }
    }
}
