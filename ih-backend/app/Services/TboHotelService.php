<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Str;

class TboHotelService
{
    public function __construct(private ?Client $client = null)
    {
    }

    public function search(array $params): array
    {
        if ($this->useMock()) {
            $city = strtoupper($params['city'] ?? 'GOA');

            return [
                'requestId' => uniqid('req_', true),
                'results' => [
                    [
                        'offerId' => 'OFF_HT_' . Str::upper(Str::random(6)),
                        'hotelId' => 'H' . rand(100, 999),
                        'name' => 'City Inn',
                        'city' => $city,
                        'price' => 2499.0,
                        'currency' => 'INR',
                    ],
                    [
                        'offerId' => 'OFF_HT_' . Str::upper(Str::random(6)),
                        'hotelId' => 'H' . rand(100, 999),
                        'name' => 'Sunrise Stay',
                        'city' => $city,
                        'price' => 3199.0,
                        'currency' => 'INR',
                    ],
                ],
            ];
        }

        $client = $this->client ?? new Client(['base_uri' => env('TBO_HOTEL_BASE')]);
        // TODO: implement TBO hotel search mapping
        $client->post('/Search', ['json' => $params]);

        return [
            'requestId' => uniqid('req_', true),
            'results' => [],
        ];
    }

    public function book(array $payload): array
    {
        if ($this->useMock()) {
            return [
                'bookingRef' => 'BKHT' . rand(1000, 9999),
                'status' => 'CONFIRMED',
                'voucherId' => 'VCH' . rand(10000, 99999),
            ];
        }

        $client = $this->client ?? new Client(['base_uri' => env('TBO_HOTEL_BASE')]);
        // TODO: implement TBO hotel book mapping
        $client->post('/Book', ['json' => $payload]);

        return [
            'status' => 'PENDING',
        ];
    }

    private function useMock(): bool
    {
        return (bool) env('USE_MOCK', true);
    }
}
