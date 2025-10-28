<?php

namespace App\Services\TBO;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use RuntimeException;
use App\Support\Http\GuzzleFactory;

class HotelService
{
    private array $config;
    private float $hotelMarkupPct;
    private ?string $tokenId = null;
    private ?string $tokenExpiresAt = null;

    public function __construct()
    {
        $this->config = config('services.tbo', []);
        $this->hotelMarkupPct = (float) Arr::get($this->config, 'hotel_markup_pct', 0);
        
        Log::info('HotelService config', [
            'use_mock' => Arr::get($this->config, 'use_mock'),
            'config_keys' => array_keys($this->config)
        ]);
    }

    public function getMarkupPct(): float
    {
        return $this->hotelMarkupPct;
    }

    /**
     * Authenticate with TBO to get TokenId
     */
    public function authenticate(): string
    {
        if ($this->tokenId && $this->tokenExpiresAt && now()->lt($this->tokenExpiresAt)) {
            return $this->tokenId;
        }

        $payload = [
            'ClientId' => $this->config['client_id'],
            'UserName' => $this->config['username'],
            'Password' => $this->config['password'],
            'EndUserIp' => $this->config['end_user_ip'],
        ];

        try {
            $response = $this->httpClient()->post(
                $this->config['hotel_auth_rest_url'],
                [
                    'json' => $payload,
                    'auth' => [$this->config['username'], $this->config['password']],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);
            
            if (isset($data['TokenId'])) {
                $this->tokenId = $data['TokenId'];
                $this->tokenExpiresAt = now()->addHours(23); // Token valid for 24 hours
                
                Log::info('TBO Hotel authentication successful', [
                    'tokenId' => substr($this->tokenId, 0, 10) . '...',
                    'expires_at' => $this->tokenExpiresAt
                ]);
                
                return $this->tokenId;
            }

            $errorMsg = is_array($data['Error'] ?? null) ? json_encode($data['Error']) : ($data['Error'] ?? 'Unknown error');
            throw new RuntimeException('Authentication failed: ' . $errorMsg);
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
            if (strpos($errorMsg, 'Array to string') !== false) {
                $errorMsg = $errorMsg . ' (Check response structure)';
            }
            Log::error('TBO Hotel authentication failed', ['error' => $errorMsg]);
            throw new RuntimeException('Failed to authenticate with TBO: ' . $errorMsg);
        }
    }

    /**
     * Get country list (Basic Auth only)
     */
    public function countryList(): array
    {
        $cacheKey = 'tbo_countries';
        
        return Cache::remember($cacheKey, now()->addDays(7), function () {
            try {
                $response = $this->httpClient()->get(
                    $this->config['hotel_country_list_url'],
                    ['auth' => [$this->config['username'], $this->config['password']]]
                );

                $data = json_decode($response->getBody()->getContents(), true);
                return $data['Response'] ?? [];
            } catch (\Exception $e) {
                Log::error('Failed to fetch country list', ['error' => $e->getMessage()]);
                return [];
            }
        });
    }

    /**
     * Get city list for a country
     */
    public function cityList(string $countryCode): array
    {
        $cacheKey = "tbo_cities_{$countryCode}";
        
        return Cache::remember($cacheKey, now()->addDays(7), function () use ($countryCode) {
            try {
                $response = $this->httpClient()->get(
                    $this->config['hotel_city_list_url'] . "?CountryCode={$countryCode}",
                    ['auth' => [$this->config['username'], $this->config['password']]]
                );

                $data = json_decode($response->getBody()->getContents(), true);
                return $data['Response'] ?? [];
            } catch (\Exception $e) {
                Log::error('Failed to fetch city list', ['error' => $e->getMessage()]);
                return [];
            }
        });
    }

    /**
     * Get hotel codes for a city
     */
    public function hotelCodes(string $cityCode): array
    {
        $cacheKey = "tbo_hotels_{$cityCode}";
        
        return Cache::remember($cacheKey, now()->addDays(3), function () use ($cityCode) {
            try {
                $response = $this->httpClient()->get(
                    $this->config['hotel_codes_url'] . "?CityCode={$cityCode}",
                    ['auth' => [$this->config['username'], $this->config['password']]]
                );

                $data = json_decode($response->getBody()->getContents(), true);
                return $data['Response'] ?? [];
            } catch (\Exception $e) {
                Log::error('Failed to fetch hotel codes', ['error' => $e->getMessage()]);
                return [];
            }
        });
    }

    /**
     * Get hotel details
     */
    public function hotelDetails(array $hotelCodes): array
    {
        $payload = [
            'HotelCodes' => $hotelCodes,
            'TokenId' => $this->authenticate(),
        ];

        try {
            $response = $this->httpClient()->post(
                $this->config['hotel_details_url'],
                [
                    'json' => $payload,
                    'auth' => [$this->config['username'], $this->config['password']],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);
            return $data['Response'] ?? [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch hotel details', ['error' => $e->getMessage()]);
            throw new RuntimeException('Failed to fetch hotel details: ' . $e->getMessage());
        }
    }

    /**
     * Search hotels with availability and rates
     */
    public function search(array $payload): array
    {
        Log::info('Hotel search called', ['use_mock' => $this->shouldUseMock(), 'payload' => $payload]);
        
        if ($this->shouldUseMock()) {
            Log::info('Using mock data for hotel search');
            return $this->mockResponse('search', $payload);
        }

        $searchPayload = [
            'CheckIn' => $payload['checkIn'],
            'CheckOut' => $payload['checkOut'],
            'HotelCodes' => $payload['hotelCodes'],
            'GuestNationality' => $payload['guestNationality'] ?? 'IN',
            'NoOfRooms' => count($payload['rooms']),
            'PaxRooms' => $payload['rooms'],
            'IsDetailedResponse' => true,
            'TokenId' => $this->authenticate(),
        ];

        // Add optional filters
        if (isset($payload['filters'])) {
            $searchPayload = array_merge($searchPayload, $payload['filters']);
        }

        try {
            $response = $this->httpClient()->post(
                $this->config['hotel_search_url'],
                [
                    'json' => $searchPayload,
                    'auth' => [$this->config['username'], $this->config['password']],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);
            
            if (isset($data['Response'])) {
                return $this->applyMarkupToSearchResults($data['Response']);
            }

            throw new RuntimeException('Search failed: ' . ($data['Error'] ?? 'Unknown error'));
        } catch (\Exception $e) {
            Log::error('Hotel search failed', ['error' => $e->getMessage(), 'payload' => $searchPayload]);
            throw new RuntimeException('Hotel search failed: ' . $e->getMessage());
        }
    }

    /**
     * PreBook - verify price and policy before booking
     */
    public function preBook(string $bookingCode): array
    {
        $payload = [
            'BookingCode' => $bookingCode,
            'TokenId' => $this->authenticate(),
        ];

        try {
            $response = $this->httpClient()->post(
                $this->config['hotel_prebook_url'],
                [
                    'json' => $payload,
                    'auth' => [$this->config['username'], $this->config['password']],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);
            
            if (isset($data['Response'])) {
                return $data['Response'];
            }

            throw new RuntimeException('PreBook failed: ' . ($data['Error'] ?? 'Unknown error'));
        } catch (\Exception $e) {
            Log::error('Hotel prebook failed', ['error' => $e->getMessage(), 'bookingCode' => $bookingCode]);
            throw new RuntimeException('Hotel prebook failed: ' . $e->getMessage());
        }
    }

    /**
     * Book hotel (hold or voucher directly)
     */
    public function book(array $payload): array
    {
        $bookingPayload = [
            'EndUserIp' => $this->config['end_user_ip'],
            'BookingCode' => $payload['bookingCode'],
            'GuestNationality' => $payload['guestNationality'] ?? 'IN',
            'IsVoucherBooking' => $payload['isVoucherBooking'] ?? false,
            'NetAmount' => $payload['netAmount'],
            'HotelRoomsDetails' => $payload['hotelRoomsDetails'],
            'HotelPassenger' => $payload['hotelPassenger'],
            'TokenId' => $this->authenticate(),
        ];

        // Add optional fields
        if (isset($payload['packageDetails'])) {
            $bookingPayload['PackageDetails'] = $payload['packageDetails'];
        }
        if (isset($payload['transportDetails'])) {
            $bookingPayload['TransportDetails'] = $payload['transportDetails'];
        }

        try {
            $response = $this->httpClient()->post(
                $this->config['hotel_book_url'],
                [
                    'json' => $bookingPayload,
                    'auth' => [$this->config['username'], $this->config['password']],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);
            
            if (isset($data['Response'])) {
                return $data['Response'];
            }

            throw new RuntimeException('Booking failed: ' . ($data['Error'] ?? 'Unknown error'));
        } catch (\Exception $e) {
            Log::error('Hotel booking failed', ['error' => $e->getMessage(), 'payload' => $bookingPayload]);
            throw new RuntimeException('Hotel booking failed: ' . $e->getMessage());
        }
    }

    /**
     * Generate voucher for a hold booking
     */
    public function generateVoucher(string $bookingId): array
    {
        $payload = [
            'EndUserIp' => $this->config['end_user_ip'],
            'TokenId' => $this->authenticate(),
            'BookingId' => $bookingId,
        ];

        try {
            $response = $this->httpClient()->post(
                $this->config['hotel_generate_voucher_url'],
                [
                    'json' => $payload,
                    'auth' => [$this->config['username'], $this->config['password']],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);
            
            if (isset($data['Response'])) {
                return $data['Response'];
            }

            throw new RuntimeException('Voucher generation failed: ' . ($data['Error'] ?? 'Unknown error'));
        } catch (\Exception $e) {
            Log::error('Hotel voucher generation failed', ['error' => $e->getMessage(), 'bookingId' => $bookingId]);
            throw new RuntimeException('Hotel voucher generation failed: ' . $e->getMessage());
        }
    }

    /**
     * Generate hotel invoice/voucher (alias for generateVoucher)
     */
    public function generateInvoice(array $payload): array
    {
        $bookingId = $payload['bookingId'] ?? $payload['BookingId'] ?? null;
        if (!$bookingId) {
            throw new RuntimeException('BookingId is required for voucher generation');
        }
        
        return $this->generateVoucher($bookingId);
    }

    /**
     * Get booking details
     */
    public function getBookingDetail(array $query): array
    {
        $payload = [
            'TokenId' => $this->authenticate(),
        ];

        // Use BookingId (preferred) or ConfirmationNo or TraceId
        if (isset($query['bookingId'])) {
            $payload['BookingId'] = $query['bookingId'];
        } elseif (isset($query['confirmationNo'])) {
            $payload['ConfirmationNo'] = $query['confirmationNo'];
            $payload['LeadGuestName'] = $query['leadGuestName'] ?? '';
        } elseif (isset($query['traceId'])) {
            $payload['TraceId'] = $query['traceId'];
        } else {
            throw new RuntimeException('Must provide bookingId, confirmationNo, or traceId');
        }

        try {
            $response = $this->httpClient()->post(
                $this->config['hotel_booking_details_url'],
                [
                    'json' => $payload,
                    'auth' => [$this->config['username'], $this->config['password']],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);
            
            if (isset($data['Response'])) {
                return $data['Response'];
            }

            throw new RuntimeException('Get booking details failed: ' . ($data['Error'] ?? 'Unknown error'));
        } catch (\Exception $e) {
            Log::error('Get hotel booking details failed', ['error' => $e->getMessage(), 'query' => $query]);
            throw new RuntimeException('Get hotel booking details failed: ' . $e->getMessage());
        }
    }

    /**
     * Send cancellation change request
     */
    public function cancelSendChange(string $bookingId): array
    {
        $payload = [
            'EndUserIp' => $this->config['end_user_ip'],
            'TokenId' => $this->authenticate(),
            'BookingId' => $bookingId,
        ];

        try {
            $response = $this->httpClient()->post(
                $this->config['hotel_send_change_request_url'],
                [
                    'json' => $payload,
                    'auth' => [$this->config['username'], $this->config['password']],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);
            
            if (isset($data['Response'])) {
                return $data['Response'];
            }

            throw new RuntimeException('Send change request failed: ' . ($data['Error'] ?? 'Unknown error'));
        } catch (\Exception $e) {
            Log::error('Hotel send change request failed', ['error' => $e->getMessage(), 'bookingId' => $bookingId]);
            throw new RuntimeException('Hotel send change request failed: ' . $e->getMessage());
        }
    }

    /**
     * Get cancellation change request status
     */
    public function cancelGetStatus(string $changeRequestId): array
    {
        $payload = [
            'TokenId' => $this->authenticate(),
            'ChangeRequestId' => $changeRequestId,
        ];

        try {
            $response = $this->httpClient()->post(
                $this->config['hotel_get_change_request_status_url'],
                [
                    'json' => $payload,
                    'auth' => [$this->config['username'], $this->config['password']],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);
            
            if (isset($data['Response'])) {
                return $data['Response'];
            }

            throw new RuntimeException('Get change request status failed: ' . ($data['Error'] ?? 'Unknown error'));
        } catch (\Exception $e) {
            Log::error('Hotel get change request status failed', ['error' => $e->getMessage(), 'changeRequestId' => $changeRequestId]);
            throw new RuntimeException('Hotel get change request status failed: ' . $e->getMessage());
        }
    }

    /**
     * Apply markup to search results
     */
    private function applyMarkupToSearchResults(array $data): array
    {
        if ($this->hotelMarkupPct <= 0) {
            return $data;
        }

        if (isset($data['HotelSearchResult'])) {
            foreach ($data['HotelSearchResult'] as &$hotel) {
                if (isset($hotel['HotelRooms'])) {
                    foreach ($hotel['HotelRooms'] as &$room) {
                        if (isset($room['RoomRate'])) {
                            foreach ($room['RoomRate'] as &$rate) {
                                if (isset($rate['TotalFare'])) {
                                    $rate['TotalFare'] = $this->applyMarkupValue($rate['TotalFare']);
                                }
                                if (isset($rate['OfferedFare'])) {
                                    $rate['OfferedFare'] = $this->applyMarkupValue($rate['OfferedFare']);
                                }
                            }
                        }
                    }
                }
            }
        }

        return $data;
    }

    /**
     * Apply markup to a price value
     */
    private function applyMarkupValue(float $amount): float
    {
        return round($amount * (1 + $this->hotelMarkupPct / 100), 2);
    }

    /**
     * Create HTTP client with proxy support
     */
    private function httpClient(): \GuzzleHttp\Client
    {
        $opts = [
            'timeout' => 40,
            'connect_timeout' => 15,
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
        ];

        return GuzzleFactory::make($opts);
    }

    /**
     * Check if should use mock data
     */
    private function shouldUseMock(): bool
    {
        return (bool) Arr::get($this->config, 'use_mock', true);
    }

    /**
     * Generate mock response for testing
     */
    private function mockResponse(string $type, array $payload): array
    {
        $sessionId = 'MOCK_' . uniqid();
        $bookingId = 'BK' . rand(100000, 999999);
        $confirmationNo = 'CNF' . rand(100000, 999999);

        return match ($type) {
            'search' => [
                'Response' => [
                    'TraceId' => $sessionId,
                    'HotelSearchResult' => [
                        [
                            'HotelCode' => 'HOTEL001',
                            'HotelName' => 'Mock Hotel Dubai',
                            'StarRating' => 5,
                            'HotelRooms' => [
                                [
                                    'RoomTypeCode' => 'DELUXE',
                                    'RoomTypeName' => 'Deluxe Room',
                                    'MealType' => 'BB',
                                    'RoomRate' => [
                                        [
                                            'TotalFare' => 5000,
                                            'OfferedFare' => 4500,
                                            'Currency' => 'INR',
                                            'BookingCode' => 'BC' . rand(100000, 999999),
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            'prebook' => [
                'Response' => [
                    'BookingCode' => $payload['bookingCode'] ?? 'BC123456',
                    'IsPriceChanged' => false,
                    'IsPolicyChanged' => false,
                    'TotalFare' => 4500,
                    'Taxes' => 500,
                    'NetAmount' => 4000,
                    'CancellationPolicy' => 'Free cancellation until 24 hours before check-in',
                    'IsPanRequired' => false,
                    'IsPassportRequired' => false,
                ]
            ],
            'book' => [
                'Response' => [
                    'BookingStatus' => 'Confirmed',
                    'BookingId' => $bookingId,
                    'ConfirmationNo' => $confirmationNo,
                    'TotalFare' => 4500,
                    'Currency' => 'INR',
                ]
            ],
            'generateVoucher' => [
                'Response' => [
                    'VoucherStatus' => 'Generated',
                    'VoucherUrl' => 'https://mock-voucher-url.com/voucher.pdf',
                ]
            ],
            'getBookingDetail' => [
                'Response' => [
                    'BookingId' => $bookingId,
                    'ConfirmationNo' => $confirmationNo,
                    'BookingStatus' => 'Confirmed',
                    'CheckIn' => '2024-12-01',
                    'CheckOut' => '2024-12-03',
                    'HotelName' => 'Mock Hotel Dubai',
                    'TotalFare' => 4500,
                    'Currency' => 'INR',
                ]
            ],
            'cancelSendChange' => [
                'Response' => [
                    'ChangeRequestId' => 'CR' . rand(100000, 999999),
                    'Status' => 'Pending',
                ]
            ],
            'cancelGetStatus' => [
                'Response' => [
                    'ChangeRequestId' => $payload['changeRequestId'] ?? 'CR123456',
                    'Status' => 'Approved',
                    'CancellationCharge' => 500,
                    'RefundAmount' => 4000,
                ]
            ],
            default => []
        };
    }
}