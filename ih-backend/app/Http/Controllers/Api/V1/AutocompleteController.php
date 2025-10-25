<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Hotel;
use App\Models\Country;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AutocompleteController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        
        // Validate query length
        if (strlen($query) < 2) {
            return response()->json([
                'query' => $query,
                'cities' => [],
                'hotels' => [],
                'message' => 'Query must be at least 2 characters long'
            ]);
        }
        
        try {
            // Search countries
            $countries = Country::where('name', 'LIKE', $query . '%')
                ->limit(5)
                ->get()
                ->map(function ($country) {
                    return [
                        'name' => $country->name,
                        'code' => $country->iso2,
                        'iso2' => $country->iso2
                    ];
                });
            
            // Search cities
            $cities = City::with('country')
                ->where('name', 'LIKE', $query . '%')
                ->limit(10)
                ->get()
                ->map(function ($city) {
                    return [
                        'name' => $city->name,
                        'code' => $city->tbo_city_code,
                        'country' => $city->country->iso2 ?? 'IN',
                        'countryName' => $city->country->name ?? 'India'
                    ];
                });
            
            // Search hotels
            $hotels = Hotel::with('city')
                ->where('name', 'LIKE', $query . '%')
                ->limit(10)
                ->get()
                ->map(function ($hotel) {
                    return [
                        'name' => $hotel->name,
                        'code' => $hotel->tbo_hotel_code,
                        'city' => $hotel->city->name ?? 'Unknown',
                        'cityCode' => $hotel->city->tbo_city_code ?? 'Unknown'
                    ];
                });
            
            return response()->json([
                'query' => $query,
                'countries' => $countries,
                'cities' => $cities,
                'hotels' => $hotels
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'query' => $query,
                'countries' => [],
                'cities' => [],
                'hotels' => [],
                'error' => 'Failed to fetch suggestions'
            ], 500);
        }
    }
}