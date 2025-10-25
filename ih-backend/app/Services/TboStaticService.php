<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class TboStaticService
{
    private ?string $baseUrl;
    private ?string $username;
    private ?string $password;

    public function __construct()
    {
        $this->baseUrl = config('services.tbo.static_base', 'https://api.tbotechnology.in/TBOHolidays_HotelAPI');
        $this->username = config('services.tbo.basic_user', '');
        $this->password = config('services.tbo.basic_pass', '');

        if (!$this->baseUrl || !$this->username || !$this->password) {
            throw new RuntimeException('TBO static API credentials or base URL are not configured.');
        }
    }

    /**
     * Get country list from TBO API
     */
    public function getCountryList(): array
    {
        try {
            $response = Http::withBasicAuth($this->username, $this->password)
                ->timeout(30)
                ->get($this->baseUrl . '/CountryList');

            if ($response->successful()) {
                $data = $response->json();
                Log::info('TBO Country List fetched successfully', ['count' => count($data)]);
                return $data;
            }

            Log::error('TBO Country List API failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return [];
        } catch (\Exception $e) {
            Log::error('TBO Country List API exception', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get city list for a country from TBO API
     */
    public function getCityList(string $countryCode): array
    {
        try {
            $response = Http::withBasicAuth($this->username, $this->password)
                ->timeout(30)
                ->get($this->baseUrl . '/CityList', [
                    'CountryCode' => $countryCode
                ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('TBO City List fetched successfully', [
                    'country' => $countryCode,
                    'count' => count($data)
                ]);
                return $data;
            }

            Log::error('TBO City List API failed', [
                'country' => $countryCode,
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return [];
        } catch (\Exception $e) {
            Log::error('TBO City List API exception', [
                'country' => $countryCode,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get hotel list for a city from TBO API
     */
    public function getHotelList(string $cityCode): array
    {
        try {
            $response = Http::withBasicAuth($this->username, $this->password)
                ->timeout(30)
                ->get($this->baseUrl . '/TBOHotelCodeList', [
                    'CityCode' => $cityCode
                ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('TBO Hotel List fetched successfully', [
                    'city' => $cityCode,
                    'count' => count($data)
                ]);
                return $data;
            }

            Log::error('TBO Hotel List API failed', [
                'city' => $cityCode,
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return [];
        } catch (\Exception $e) {
            Log::error('TBO Hotel List API exception', [
                'city' => $cityCode,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Test API connectivity
     */
    public function testConnection(): bool
    {
        try {
            $response = Http::withBasicAuth($this->username, $this->password)
                ->timeout(10)
                ->get($this->baseUrl . '/CountryList');

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('TBO API connection test failed', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
