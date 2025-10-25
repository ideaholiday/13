<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\TboException;
use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Booking;
use App\Services\BookingWorkflowService;
use App\Services\TBO\AirService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class FlightsController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly AirService $airService,
        private readonly BookingWorkflowService $workflowService,
    ) {
    }

    public function search(Request $request): JsonResponse
    {
        if ($request->boolean('mock')) {
            return response()->json([
                'sessionId' => 'FL123',
                'results' => [[
                    'id' => 1,
                    'carrier' => 'AI',
                    'flightNo' => 'AI101',
                    'from' => 'BOM',
                    'to' => 'LKO',
                    'departTime' => '2025-10-14T06:00:00Z',
                    'arriveTime' => '2025-10-14T08:00:00Z',
                    'duration' => 120,
                    'stops' => 0,
                    'fare' => [
                        'currency' => 'INR',
                        'final' => 5600,
                    ],
                ]],
            ]);
        }

        $data = $request->validate([
            'segments' => ['required', 'array', 'min:1'],
            'segments.*.origin' => ['required', 'string', 'size:3'],
            'segments.*.destination' => ['required', 'string', 'size:3'],
            'segments.*.departureDate' => ['required', 'date'],
            'tripType' => ['nullable', 'string'],
            'adults' => ['nullable', 'integer', 'min:1'],
            'children' => ['nullable', 'integer', 'min:0'],
            'infants' => ['nullable', 'integer', 'min:0'],
            'cabinClass' => ['nullable', 'string'],
            'preferredAirlines' => ['nullable', 'array'],
            'mock' => ['sometimes', 'boolean'],
            'fresh' => ['sometimes', 'boolean'], // Bypass cache
            'page' => ['nullable', 'integer', 'min:1'],
            'pageSize' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        // Generate cache key including route, dates, cabin, and passenger count
        $cacheKey = $this->generateCacheKey($data);
        
        // Check cache first (unless fresh=1 is requested)
        if (!$request->boolean('fresh')) {
            $cached = Cache::get($cacheKey);
            if ($cached) {
                Log::info('Flight search cache hit', ['key' => $cacheKey]);
                return response()->json($cached);
            }
        }

        $useMock = $request->boolean('mock', false);

        if (! $useMock) {
            // Real provider path with caching
            $result = $this->respond(function () use ($data) {
                $result = $this->airService->search($data);
                $result['markupPct'] ??= $this->airService->getMarkupPct();
                return $result;
            });
            
            // Get the TBO response data
            $originalData = $result->getData(true);
            
            // Return TBO response format directly for frontend compatibility
            $response = [
                'success' => true,
                'data' => $originalData
            ];
            
            // Cache the result for 300 seconds (5 minutes)
            Cache::put($cacheKey, $response, 300);
            Log::info('Flight search cached', ['key' => $cacheKey, 'ttl' => 300]);
            
            return response()->json($response);
        }

        // --- MOCKED RESPONSE (for local/dev & stability) ---
        try {
            $sessionId = 'FL-' . strtoupper(bin2hex(random_bytes(6)));
            $carriers = ['6E','AI','UK','SG','G8']; // Indigo, Air India, Vistara, SpiceJet, GoFirst
            $currency = 'INR';
            $results = [];

            foreach ($data['segments'] as $legIndex => $seg) {
                $from = strtoupper($seg['origin']);
                $to   = strtoupper($seg['destination']);
                $date = (new \DateTimeImmutable($seg['departureDate']))->setTime(7 + ($legIndex%3)*2, 15);

                // Generate 3 options per leg
                for ($i=0; $i<3; $i++) {
                    $carrier = $carriers[($legIndex + $i) % count($carriers)];
                    $flightNo = $carrier . sprintf('%03d', ($legIndex+1)*10 + $i + 1);

                    $depart = $date->modify("+" . ($i*90) . " minutes");
                    $durationMin = 90 + ($i*35) + ($legIndex*10);
                    $stops = $i===2 ? 1 : 0;
                    $arrive = $depart->modify("+{$durationMin} minutes");

                    $base = 2500 + ($legIndex*500) + ($i*600);
                    $taxes = (int) round($base * 0.28);
                    $final = $base + $taxes;

                    $results[] = [
                        'ResultIndex' => ($legIndex+1)*100 + $i + 1,
                        'Fare' => [
                            'Currency' => $currency,
                            'BaseFare' => $base,
                            'Tax' => $taxes,
                            'OfferedFare' => $final,
                            'TotalFare' => $final,
                        ],
                        'Segments' => [[
                            'Airline' => [
                                'AirlineCode' => $carrier,
                                'AirlineName' => $this->getAirlineName($carrier),
                                'FlightNumber' => $flightNo,
                            ],
                            'Origin' => [
                                'AirportCode' => $from,
                                'AirportName' => $this->getAirportName($from),
                                'CityName' => $this->getCityName($from),
                                'CountryName' => 'India',
                                'DepTime' => $depart->format('Y-m-d\TH:i:s'),
                            ],
                            'Destination' => [
                                'AirportCode' => $to,
                                'AirportName' => $this->getAirportName($to),
                                'CityName' => $this->getCityName($to),
                                'CountryName' => 'India',
                                'ArrTime' => $arrive->format('Y-m-d\TH:i:s'),
                            ],
                            'Duration' => $durationMin,
                            'Craft' => 'A320',
                            'Baggage' => '15 KG',
                            'CabinBaggage' => '7 KG',
                        ]],
                        'IsLCC' => in_array($carrier, ['6E', 'SG', 'G8']),
                        'IsRefundable' => true,
                        'AirlineRemark' => 'Mock flight data for testing',
                    ];
                }
            }

            // Apply pagination to results
            $page = (int) $request->get('page', 1);
            $pageSize = (int) $request->get('pageSize', 25);
            $pageSize = min($pageSize, 100); // Limit page size
            
            $total = count($results);
            $offset = ($page - 1) * $pageSize;
            $paginatedResults = array_slice($results, $offset, $pageSize);
            
            // Format mock response to match TBO API structure
            $tboResponse = [
                'Response' => [
                    'TraceId' => $sessionId,
                    'ResponseStatus' => 1,
                    'Results' => [$paginatedResults] // Wrap in array for outbound flights
                ]
            ];
            
            $response = [
                'success' => true,
                'data' => $tboResponse
            ];

            // Cache the mock response for 300 seconds
            Cache::put($cacheKey, $response, 300);
            Log::info('Mock flight search cached', ['key' => $cacheKey, 'ttl' => 300]);

            return response()->json($response);
        } catch (\Throwable $e) {
            Log::error('Mock flight search failed', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Unable to generate mock flights',
            ], 500);
        }
    }

    public function fareQuote(Request $request): JsonResponse
    {
        $data = $request->validate([
            'sessionId' => ['required', 'string'],
            'resultIndex' => ['required', 'integer'],
        ]);

        return $this->respond(function () use ($data) {
            $result = $this->airService->fareQuote($data);
            $result['markupPct'] ??= $this->airService->getMarkupPct();

            return $result;
        });
    }

    public function book(Request $request): JsonResponse
    {
        if ($request->boolean('mock', true)) {
            return response()->json([
                'bookingId' => 'BK1',
                'status' => 'ON_HOLD',
                'payAmount' => 5600,
            ]);
        }

        $validated = $request->validate([
            'sessionId' => ['required', 'string'],
            'resultIndex' => ['required', 'integer'],
            'contact.email' => ['required', 'email'],
            'contact.phone' => ['required', 'string'],
            'passengers' => ['required', 'array', 'min:1'],
            'passengers.*.type' => ['nullable', 'string'],
            'passengers.*.title' => ['nullable', 'string'],
            'passengers.*.firstName' => ['required', 'string'],
            'passengers.*.lastName' => ['required', 'string'],
            'passengers.*.gender' => ['nullable', 'string'],
            'passengers.*.dob' => ['nullable', 'date'],
            'pricing.totalFare' => ['required', 'numeric', 'min:0'],
            'pricing.currency' => ['nullable', 'string', 'size:3'],
        ]);

        $totalFare = (float) Arr::get($validated, 'pricing.totalFare', 0);
        $currency = Arr::get($validated, 'pricing.currency', 'INR');
        $offerKey = $this->buildFlightOfferKey($validated);

        $booking = null;
        $tboBooking = null;

        try {
            DB::transaction(function () use (&$booking, $validated, $totalFare, $currency, $offerKey) {
                $booking = Booking::query()
                    ->lockForUpdate()
                    ->where('type', Booking::TYPE_FLIGHT)
                    ->where('offer_id', $offerKey)
                    ->first();

                if (! $booking) {
                    $booking = new Booking([
                        'type' => Booking::TYPE_FLIGHT,
                        'offer_id' => $offerKey,
                    ]);
                }

                if ($booking->exists && $booking->status === Booking::STATUS_CONFIRMED) {
                    return;
                }

                $flightMeta = Arr::get($booking->meta ?? [], 'flight', []);
                $flightMeta['request'] = $validated;
                $flightMeta['pricing'] = Arr::get($validated, 'pricing', []);

                $booking->fill([
                    'status' => Booking::STATUS_ON_HOLD,
                    'payment_status' => Booking::PAYMENT_STATUS_UNPAID,
                    'total_price' => $totalFare,
                    'currency' => $currency,
                    'contact_email' => Arr::get($validated, 'contact.email'),
                    'contact_phone' => Arr::get($validated, 'contact.phone'),
                    'meta' => array_merge($booking->meta ?? [], ['flight' => $flightMeta]),
                ]);

                $booking->save();

                if ($booking->status !== Booking::STATUS_CONFIRMED) {
                    $this->syncPassengers($booking, $validated['passengers']);
                }
            });

            $booking = $booking?->fresh(['passengers']);
            if (! $booking) {
                throw new \RuntimeException('Unable to create booking record.');
            }

            $flightMeta = Arr::get($booking->meta, 'flight', []);
            $tboBooking = Arr::get($flightMeta, 'booking');

            if (! $tboBooking && $booking->status !== Booking::STATUS_CONFIRMED) {
                $tboBooking = $this->airService->book([
                    'sessionId' => Arr::get($validated, 'sessionId'),
                    'resultIndex' => Arr::get($validated, 'resultIndex'),
                    'bookRequest' => [
                        'passengers' => $validated['passengers'],
                        'contact' => Arr::get($validated, 'contact'),
                    ],
                    'clientReference' => (string) $booking->id,
                ]);

                $flightMeta['booking'] = $tboBooking;

                $booking->forceFill([
                    'pnr' => Arr::get($tboBooking, 'PNR', $booking->pnr),
                    'meta' => array_merge($booking->meta ?? [], ['flight' => $flightMeta]),
                ])->save();
            }

            return response()->json([
                'bookingId' => $booking->id,
                'status' => $booking->status,
                'pnr' => $booking->pnr,
                'tbo' => $tboBooking ?? Arr::get($booking->meta, 'flight.booking'),
            ]);
        } catch (TboException $exception) {
            if ($booking && $booking->status !== Booking::STATUS_CONFIRMED) {
                $booking->update(['status' => Booking::STATUS_FAILED]);
            }

            Log::warning('TBO flight booking failed', [
                'message' => $exception->getMessage(),
                'context' => $exception->context(),
            ]);

            return response()->json([
                'message' => $exception->getMessage(),
                'code' => $exception->getCode(),
                'context' => $exception->context(),
            ], 422);
        } catch (Throwable $exception) {
            if ($booking && $booking->status !== Booking::STATUS_CONFIRMED) {
                $booking->update(['status' => Booking::STATUS_FAILED]);
            }

            Log::error('Flight booking error', [
                'message' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Booking create failed',
            ], 500);
        }
    }

    public function ticket(Request $request): JsonResponse
    {
        if ($request->boolean('mock', true)) {
            return response()->json([
                'ticketNo' => 'AI-9999999999',
                'status' => 'TICKETED',
            ]);
        }

        $validated = $request->validate([
            'bookingId' => ['required', 'integer', 'exists:bookings,id'],
            'pnr' => ['nullable', 'string'],
        ]);

        $booking = Booking::with('passengers')->findOrFail($validated['bookingId']);

        if ($booking->type !== Booking::TYPE_FLIGHT) {
            return response()->json(['message' => 'Booking is not a flight reservation'], 422);
        }

        if (! in_array($booking->status, [Booking::STATUS_PAID, Booking::STATUS_CONFIRMED], true)) {
            return response()->json(['message' => 'Payment not completed'], 400);
        }

        try {
            $ticket = $this->workflowService->issueFlightTicket($booking, array_filter([
                'pnr' => Arr::get($validated, 'pnr'),
            ]));

            $booking->refresh();

            return response()->json([
                'status' => $booking->status,
                'pnr' => Arr::get($ticket, 'PNR', $booking->pnr),
                'ticket' => $ticket,
            ]);
        } catch (TboException $exception) {
            Log::warning('TBO flight ticket failed', [
                'message' => $exception->getMessage(),
                'context' => $exception->context(),
            ]);

            return response()->json([
                'message' => $exception->getMessage(),
                'code' => $exception->getCode(),
                'context' => $exception->context(),
            ], 422);
        } catch (Throwable $exception) {
            Log::error('Flight ticket error', [
                'message' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Unable to issue ticket. Try again later.',
            ], 500);
        }
    }

    public function pnr(Request $request): JsonResponse
    {
        $data = $request->validate([
            'pnr' => ['nullable', 'string'],
            'bookingId' => ['nullable', 'string'],
        ]);

        if (! Arr::get($data, 'pnr') && ! Arr::get($data, 'bookingId')) {
            return response()->json([
                'message' => 'Provide PNR or bookingId.',
            ], 422);
        }

        return $this->respond(fn () => $this->airService->pnr($data));
    }

    public function cancel(Request $request): JsonResponse
    {
        $data = $request->validate([
            'bookingId' => ['nullable', 'string'],
            'pnr' => ['nullable', 'string'],
            'remarks' => ['nullable', 'string'],
        ]);

        if (! Arr::get($data, 'bookingId') && ! Arr::get($data, 'pnr')) {
            return response()->json([
                'message' => 'Provide bookingId or PNR to cancel.',
            ], 422);
        }

        return $this->respond(fn () => $this->airService->cancel($data));
    }

    private function respond(callable $callback): JsonResponse
    {
        try {
            return response()->json($callback());
        } catch (TboException $exception) {
            Log::warning('TBO flight request failed', [
                'message' => $exception->getMessage(),
                'context' => $exception->context(),
            ]);

            return response()->json([
                'message' => $exception->getMessage(),
                'code' => $exception->getCode(),
                'context' => $exception->context(),
            ], 422);
        } catch (Throwable $exception) {
            Log::error('Flight endpoint error', [
                'message' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Unexpected error while communicating with TBO.',
            ], 500);
        }
    }

    private function buildFlightOfferKey(array $data): string
    {
        $sessionId = Arr::get($data, 'sessionId');
        $resultIndex = Arr::get($data, 'resultIndex');

        return trim((string) $sessionId).'|'.trim((string) $resultIndex);
    }

    private function syncPassengers(Booking $booking, array $passengers): void
    {
        $booking->passengers()->delete();

        foreach ($passengers as $passenger) {
            $booking->passengers()->create([
                'type' => strtoupper(substr((string) Arr::get($passenger, 'type', 'ADT'), 0, 3)),
                'title' => Arr::get($passenger, 'title'),
                'first_name' => Arr::get($passenger, 'firstName'),
                'last_name' => Arr::get($passenger, 'lastName'),
                'dob' => Arr::get($passenger, 'dob'),
                'gender' => Arr::get($passenger, 'gender'),
                'meta' => $passenger,
            ]);
        }
    }

    /**
     * Get airline name from code
     */
    private function getAirlineName(string $code): string
    {
        return match ($code) {
            '6E' => 'IndiGo',
            'AI' => 'Air India',
            'UK' => 'Vistara',
            'SG' => 'SpiceJet',
            'G8' => 'GoFirst',
            default => $code,
        };
    }

    /**
     * Get airport name from code
     */
    private function getAirportName(string $code): string
    {
        return match ($code) {
            'DEL' => 'Indira Gandhi International Airport',
            'BOM' => 'Chhatrapati Shivaji Maharaj International Airport',
            'BLR' => 'Kempegowda International Airport',
            'HYD' => 'Rajiv Gandhi International Airport',
            'CCU' => 'Netaji Subhash Chandra Bose International Airport',
            'MAA' => 'Chennai International Airport',
            'PNQ' => 'Pune Airport',
            'GOI' => 'Goa International Airport',
            'LKO' => 'Chaudhary Charan Singh International Airport',
            'AMD' => 'Sardar Vallabhbhai Patel International Airport',
            default => $code . ' Airport',
        };
    }

    /**
     * Get city name from airport code
     */
    private function getCityName(string $code): string
    {
        return match ($code) {
            'DEL' => 'New Delhi',
            'BOM' => 'Mumbai',
            'BLR' => 'Bangalore',
            'HYD' => 'Hyderabad',
            'CCU' => 'Kolkata',
            'MAA' => 'Chennai',
            'PNQ' => 'Pune',
            'GOI' => 'Goa',
            'LKO' => 'Lucknow',
            'AMD' => 'Ahmedabad',
            default => $code,
        };
    }

    /**
     * Generate cache key for flight search including route, dates, cabin, and passenger count
     */
    private function generateCacheKey(array $data): string
    {
        $segments = Arr::get($data, 'segments', []);
        $route = [];
        
        foreach ($segments as $segment) {
            $route[] = sprintf(
                '%s-%s-%s',
                strtoupper($segment['origin']),
                strtoupper($segment['destination']),
                $segment['departureDate']
            );
        }
        
        $passengers = sprintf(
            '%dA%dC%dI',
            Arr::get($data, 'adults', 1),
            Arr::get($data, 'children', 0),
            Arr::get($data, 'infants', 0)
        );
        
        $cabinClass = Arr::get($data, 'cabinClass', 'ECONOMY');
        
        return sprintf(
            'flights:%s:%s:%s',
            implode('|', $route),
            $passengers,
            strtoupper($cabinClass)
        );
    }
}
