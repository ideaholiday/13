<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\TBO\AirService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class FlightController extends Controller
{
    public function __construct(private readonly AirService $airService)
    {
    }

    /**
     * Search flights
     * POST /api/v1/flights/search
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'segments' => 'required|array|min:1',
            'segments.*.origin' => 'required|string|size:3',
            'segments.*.destination' => 'required|string|size:3',
            'segments.*.departureDate' => 'required|date|after_or_equal:today',
            'tripType' => 'nullable|string',
            'adults' => 'nullable|integer|min:1|max:9',
            'children' => 'nullable|integer|min:0|max:8',
            'infants' => 'nullable|integer|min:0|max:8',
            'cabinClass' => 'nullable|string',
            'mock' => 'sometimes|boolean',
            'fresh' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Use segments directly from request
            $segments = $request->input('segments', []);
            
            // Ensure segments have proper format
            foreach ($segments as &$segment) {
                $segment['origin'] = strtoupper($segment['origin']);
                $segment['destination'] = strtoupper($segment['destination']);
                if (!str_contains($segment['departureDate'], 'T')) {
                    $segment['departureDate'] .= 'T00:00:00';
                }
            }
            
            $payload = [
                'segments' => $segments,
                'tripType' => $request->input('tripType', 'O'),
                'cabinClass' => $request->input('cabinClass', 'E'),
                'adults' => (int) $request->input('adults', 1),
                'children' => (int) $request->input('children', 0),
                'infants' => (int) $request->input('infants', 0),
            ];
            
            // Log request for debugging
            Log::info('Flight search request', ['payload' => $payload]);
            
            $result = $this->airService->search($payload);
            
            // Check if we have valid results
            if (!$result || !isset($result['Response'])) {
                Log::warning('No flight results found', [
                    'origin' => $payload['origin'],
                    'destination' => $payload['destination'],
                    'departDate' => $payload['departDate']
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'No flights found for your search criteria',
                    'suggestions' => [
                        'Try different dates',
                        'Check nearby airports',
                        'Adjust passenger count',
                        'Try different cabin class'
                    ],
                    'searchCriteria' => [
                        'origin' => $payload['origin'],
                        'destination' => $payload['destination'],
                        'departDate' => $payload['departDate'],
                        'returnDate' => $payload['returnDate'],
                        'adults' => $payload['adults'],
                        'children' => $payload['children'],
                        'infants' => $payload['infants'],
                        'cabinClass' => $payload['cabinClass']
                    ]
                ], 200);
            }
            
            // Check if results array is empty
            $results = $result['Response']['Results'] ?? [];
            $flatResults = [];
            
            // Flatten results if they're nested
            if (is_array($results)) {
                foreach ($results as $resultGroup) {
                    if (is_array($resultGroup)) {
                        if (isset($resultGroup[0]) && is_array($resultGroup[0])) {
                            // Nested array structure
                            foreach ($resultGroup as $item) {
                                if (is_array($item)) {
                                    $flatResults[] = $item;
                                }
                            }
                        } else {
                            // Single level array
                            $flatResults[] = $resultGroup;
                        }
                    }
                }
            }
            
            if (empty($flatResults)) {
                Log::warning('Empty flight results', [
                    'origin' => $payload['origin'],
                    'destination' => $payload['destination'],
                    'departDate' => $payload['departDate'],
                    'traceId' => $result['Response']['TraceId'] ?? null
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'No flights available for your selected route and dates',
                    'suggestions' => [
                        'Try searching for different dates',
                        'Check if the route is served by airlines',
                        'Consider nearby airports',
                        'Try flexible date search'
                    ],
                    'searchCriteria' => [
                        'origin' => $payload['origin'],
                        'destination' => $payload['destination'],
                        'departDate' => $payload['departDate'],
                        'returnDate' => $payload['returnDate'],
                        'adults' => $payload['adults'],
                        'children' => $payload['children'],
                        'infants' => $payload['infants'],
                        'cabinClass' => $payload['cabinClass']
                    ],
                    'traceId' => $result['Response']['TraceId'] ?? null
                ], 200);
            }
            
            return response()->json(['success' => true, 'data' => $result]);
            
        } catch (\Exception $e) {
            Log::error('Flight search error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $payload ?? null
            ]);
            
            // Provide more specific error messages based on error type
            $errorMessage = 'Unable to search flights at this time';
            $suggestions = ['Please try again later', 'Contact support if the issue persists'];
            
            if (strpos($e->getMessage(), 'timeout') !== false) {
                $errorMessage = 'Search request timed out';
                $suggestions = ['Please try again', 'Check your internet connection'];
            } elseif (strpos($e->getMessage(), 'connection') !== false) {
                $errorMessage = 'Unable to connect to flight search service';
                $suggestions = ['Please try again', 'Check your internet connection'];
            } elseif (strpos($e->getMessage(), 'validation') !== false) {
                $errorMessage = 'Invalid search parameters';
                $suggestions = ['Please check your search criteria', 'Ensure all fields are filled correctly'];
            }
            
            return response()->json([
                'success' => false,
                'message' => $errorMessage,
                'suggestions' => $suggestions,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send Change Request
     * POST /api/v1/flights/send-change-request
     */
    public function sendChangeRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bookingId' => 'required|string',
            'changeType' => 'required|string',
            'remarks' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        try {
            $payload = [
                'BookingId' => $request->input('bookingId'),
                'ChangeType' => $request->input('changeType'),
                'Remarks' => $request->input('remarks'),
            ];
            $result = $this->airService->sendChangeRequest($payload);
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Change Request Status
     * POST /api/v1/flights/get-change-request-status
     */
    public function getChangeRequestStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'changeRequestId' => 'required|string',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        try {
            $payload = [
                'ChangeRequestId' => $request->input('changeRequestId'),
            ];
            $result = $this->airService->getChangeRequestStatus($payload);
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Release PNR Request
     * POST /api/v1/flights/release-pnr-request
     */
    public function releasePNRRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pnr' => 'required|string',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        try {
            $payload = [
                'PNR' => $request->input('pnr'),
            ];
            $result = $this->airService->releasePNRRequest($payload);
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Cancellation Charges
     * POST /api/v1/flights/get-cancellation-charges
     */
    public function getCancellationCharges(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bookingId' => 'required|string',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        try {
            $payload = [
                'BookingId' => $request->input('bookingId'),
            ];
            $result = $this->airService->getCancellationCharges($payload);
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get fare quote for selected flight
     * POST /api/v1/flights/fare-quote
     */
    public function fareQuote(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resultIndex' => 'required|string',
            'traceId' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $payload = [
                'resultIndex' => $request->input('resultIndex'),
                'traceId' => $request->input('traceId'),
            ];

            $result = $this->airService->fareQuote($payload);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Fare quote error', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Fare quote failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Book flight
     * POST /api/v1/flights/book
     */
    public function book(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resultIndex' => 'required|string',
            'traceId' => 'required|string',
            'passengers' => 'required|array|min:1',
            'passengers.*.title' => 'required|in:Mr,Ms,Mrs,Dr,Mstr,Miss',
            'passengers.*.firstName' => 'required|string|max:50',
            'passengers.*.lastName' => 'required|string|max:50',
            'passengers.*.type' => 'required|in:ADT,CHD,INF',
            'passengers.*.dateOfBirth' => 'required|date|before:today',
            'passengers.*.gender' => 'required|in:M,F',
            'passengers.*.passportNo' => 'nullable|string|max:20',
            'passengers.*.passportExpiry' => 'nullable|date|after:today',
            'contactInfo.email' => 'required|email',
            'contactInfo.phone' => 'required|string|max:15',
            'contactInfo.address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $payload = [
                'resultIndex' => $request->input('resultIndex'),
                'traceId' => $request->input('traceId'),
                'passengers' => $request->input('passengers'),
                'contactInfo' => $request->input('contactInfo'),
            ];

            $result = $this->airService->book($payload);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Flight booking error', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Flight booking failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Issue ticket
     * POST /api/v1/flights/ticket
     */
    public function ticket(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bookingId' => 'required|string',
            'pnr' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $payload = [
                'bookingId' => $request->input('bookingId'),
                'pnr' => $request->input('pnr'),
            ];

            $result = $this->airService->ticket($payload);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Ticket issuance error', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ticket issuance failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get booking details
     * POST /api/v1/flights/booking-details
     */
    public function bookingDetails(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bookingId' => 'nullable|string',
            'pnr' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $payload = [
                'bookingId' => $request->input('bookingId'),
                'pnr' => $request->input('pnr'),
            ];

            $result = $this->airService->pnr($payload);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Get booking details error', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get booking details: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get booking by ID - Standardized endpoint
     * GET /api/v1/bookings/{id}
     */
    public function getBooking(string $id)
    {
        try {
            $payload = [
                'bookingId' => $id,
            ];

            $result = $this->airService->pnr($payload);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Get booking error', [
                'bookingId' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fare Rule
     * POST /api/v1/flights/fare-rule
     */
    public function fareRule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resultIndex' => 'required|string',
            'traceId' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $payload = [
                'ResultIndex' => $request->input('resultIndex'),
                'TraceId' => $request->input('traceId'),
            ];
            $result = $this->airService->fareRule($payload);
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * SSR
     * POST /api/v1/flights/ssr
     */
    public function ssr(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resultIndex' => 'required|string',
            'traceId' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $payload = [
                'ResultIndex' => $request->input('resultIndex'),
                'TraceId' => $request->input('traceId'),
            ];
            $result = $this->airService->ssr($payload);
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Calendar Fare
     * POST /api/v1/flights/calendar-fare
     */
    public function getCalendarFare(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'origin' => 'required|string|size:3',
            'destination' => 'required|string|size:3',
            'tripType' => 'required|in:O,R',
            'cabinClass' => 'required|in:E,PE,B,F',
            'departDate' => 'required|date|after:yesterday',
            'returnDate' => 'nullable|date|after:departDate',
            'adults' => 'required|integer|min:1|max:9',
            'children' => 'nullable|integer|min:0|max:8',
            'infants' => 'nullable|integer|min:0|max:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Map cabin to TBO int: E->1, PE->2, B->3, F->4
            $cabinMap = ['E' => 1, 'PE' => 2, 'B' => 3, 'F' => 4];
            $cabinInt = $cabinMap[strtoupper($request->input('cabinClass'))] ?? 1;
            $payload = [
                'Origin' => strtoupper($request->input('origin')),
                'Destination' => strtoupper($request->input('destination')),
                'CabinClass' => $cabinInt,
                'JourneyType' => $request->input('tripType') === 'R' ? 2 : 1,
                'PreferredDepartureTime' => $request->input('departDate').'T00:00:00',
                'PreferredArrivalTime' => $request->input('returnDate') ? $request->input('returnDate').'T00:00:00' : null,
                'AdultCount' => (int) $request->input('adults', 1),
                'ChildCount' => (int) $request->input('children', 0),
                'InfantCount' => (int) $request->input('infants', 0),
            ];
            $result = $this->airService->getCalendarFare($payload);
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update Calendar Fare Of Day
     * POST /api/v1/flights/calendar-fare/update
     */
    public function updateCalendarFareOfDay(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'traceId' => 'required|string',
            'resultIndex' => 'required|string',
            'origin' => 'required|string|size:3',
            'destination' => 'required|string|size:3',
            'date' => 'required|date|after:yesterday',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $payload = [
                'TraceId' => $request->input('traceId'),
                'ResultIndex' => $request->input('resultIndex'),
                'Origin' => strtoupper($request->input('origin')),
                'Destination' => strtoupper($request->input('destination')),
                'TravelDate' => $request->input('date').'T00:00:00',
            ];
            $result = $this->airService->updateCalendarFareOfDay($payload);
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Price RBD
     * POST /api/v1/flights/price-rbd
     */
    public function priceRBD(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'traceId' => 'required|string',
            'resultIndex' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $payload = [
                'TraceId' => $request->input('traceId'),
                'ResultIndex' => $request->input('resultIndex'),
            ];
            $result = $this->airService->priceRBD($payload);
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
