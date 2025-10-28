<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Booking;
use App\Models\City;
use App\Models\Country;
use App\Models\Hotel;
use App\Models\HotelPrebook;
use App\Models\HotelSearchSession;
use App\Services\TBO\HotelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Razorpay\Api\Api;

class HotelsController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly HotelService $hotelService,
    ) {
    }

    /**
     * Get countries list
     * GET /api/v1/hotels/countries
     */
    public function countries(): JsonResponse
    {
        try {
            $countries = Country::orderBy('name')
                ->get(['id', 'iso2', 'iso3', 'name', 'tbo_country_code']);

            return response()->json([
                'success' => true,
                'data' => $countries,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch countries', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch countries',
            ], 500);
        }
    }

    /**
     * Get cities list for a country
     * GET /api/v1/hotels/cities?country=AE
     */
    public function cities(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'country' => 'required|string|size:2',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $country = Country::where('iso2', $request->country)->first();
            if (!$country) {
                return response()->json([
                    'success' => false,
                    'message' => 'Country not found',
                ], 404);
            }

            $cities = City::where('country_id', $country->id)
                ->orderBy('name')
                ->get(['id', 'name', 'tbo_city_code', 'latitude', 'longitude']);

            return response()->json([
                'success' => true,
                'data' => $cities,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch cities', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cities',
            ], 500);
        }
    }

    /**
     * Get hotel codes for a city
     * GET /api/v1/hotels/hotel-codes?city=DXB
     */
    public function hotelCodes(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'city' => 'required|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $city = City::where('tbo_city_code', $request->city)->first();
            if (!$city) {
                return response()->json([
                    'success' => false,
                    'message' => 'City not found',
                ], 404);
            }

            $hotels = Hotel::where('city_id', $city->id)
                ->active()
                ->get(['id', 'tbo_hotel_code', 'name', 'star_rating', 'guest_rating']);

            return response()->json([
                'success' => true,
                'data' => $hotels,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch hotel codes', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch hotel codes',
            ], 500);
        }
    }

    /**
     * Search hotels
     * POST /api/v1/hotels/search
     */
    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'cityId' => 'required|string',
            'cityName' => 'required|string',
            'checkIn' => 'required|date|after_or_equal:today',
            'checkOut' => 'required|date|after:checkIn',
            'currency' => 'nullable|string|size:3',
            'nationality' => 'nullable|string|size:2',
            'rooms' => 'required|array|min:1|max:9',
            'rooms.*.adults' => 'required|integer|min:1|max:6',
            'rooms.*.children' => 'nullable|integer|min:0|max:4',
            'rooms.*.childAges' => 'nullable|array',
            'filters' => 'nullable|array',
            'page' => 'nullable|integer|min:1',
            'pageSize' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();

            $city = City::where('tbo_city_code', $data['cityId'])->first();
            if (!$city) {
                return response()->json([
                    'success' => false,
                    'message' => 'City not found',
                ], 404);
            }

            $hotelCodes = Hotel::where('city_id', $city->id)
                ->active()
                ->pluck('tbo_hotel_code')
                ->filter()
                ->values()
                ->all();

            $usingMockData = empty($hotelCodes);
            if ($usingMockData) {
                $hotelCodes = ['MOCKHOTEL1', 'MOCKHOTEL2'];
            }

            $paxRooms = $this->preparePaxRooms($data['rooms']);

            $searchPayload = [
                'checkIn' => $data['checkIn'],
                'checkOut' => $data['checkOut'],
                'hotelCodes' => $hotelCodes,
                'guestNationality' => $data['nationality'] ?? 'IN',
                'rooms' => $paxRooms,
                'filters' => $data['filters'] ?? [],
            ];

            if (!empty($data['currency'])) {
                $searchPayload['currency'] = $data['currency'];
            }

            $rawResults = $this->hotelService->search($searchPayload);
            $normalized = $this->normalizeHotelSearchResponse($rawResults);

            $sessionId = $normalized['traceId'] ?? ('HTL_' . Str::random(20));
            $results = $normalized['results'];

            $page = max(1, (int) ($data['page'] ?? $request->get('page', 1)));
            $pageSize = max(1, min((int) ($data['pageSize'] ?? $request->get('pageSize', 25)), 100));
            $total = count($results);
            $offset = ($page - 1) * $pageSize;
            $paginatedResults = array_slice($results, $offset, $pageSize);

            HotelSearchSession::create([
                'trace_id' => $sessionId,
                'city_id' => $city->id,
                'check_in' => $data['checkIn'],
                'check_out' => $data['checkOut'],
                'guest_nationality' => $data['nationality'] ?? 'IN',
                'currency' => $data['currency'] ?? 'INR',
                'rooms' => $data['rooms'],
                'search_params' => $data,
                'search_results' => $normalized['rawResponse'],
                'status' => 'completed',
                'expires_at' => now()->addHours(2),
            ]);

            $meta = [
                'total' => $total,
                'page' => $page,
                'pageSize' => $pageSize,
                'lastPage' => $total > 0 ? (int) ceil($total / $pageSize) : 1,
                'hasMorePages' => $offset + $pageSize < $total,
                'from' => $total > 0 ? $offset + 1 : null,
                'to' => $total > 0 ? min($offset + $pageSize, $total) : null,
                'markupPct' => $this->hotelService->getMarkupPct(),
                'usingMockData' => $usingMockData || (bool) config('services.tbo.use_mock'),
                'cityId' => $data['cityId'],
                'cityName' => $data['cityName'],
                'guestNationality' => $data['nationality'] ?? 'IN',
                'currency' => $data['currency'] ?? 'INR',
            ];

            if (empty($paginatedResults)) {
                Log::info('Hotel search returned no results', [
                    'cityId' => $data['cityId'],
                    'checkIn' => $data['checkIn'],
                    'checkOut' => $data['checkOut'],
                    'traceId' => $sessionId,
                ]);
            }

            return response()->json([
                'sessionId' => $sessionId,
                'traceId' => $sessionId,
                'results' => $paginatedResults,
                'meta' => $meta,
            ]);
        } catch (\Exception $e) {
            Log::error('Hotel search failed', ['error' => $e->getMessage(), 'request' => $request->all()]);
            return response()->json([
                'success' => false,
                'message' => 'Hotel search failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function preparePaxRooms(array $rooms): array
    {
        $paxRooms = [];

        foreach ($rooms as $room) {
            $adults = (int) ($room['adults'] ?? 0);
            $children = (int) ($room['children'] ?? 0);
            $childAges = array_map('intval', $room['childAges'] ?? []);

            if ($children > count($childAges)) {
                $childAges = array_pad($childAges, $children, 5);
            } else {
                $childAges = array_slice($childAges, 0, $children);
            }

            $paxRooms[] = [
                'Adults' => $adults,
                'Children' => $children,
                'ChildrenAge' => $childAges,
            ];
        }

        return $paxRooms;
    }

    private function normalizeHotelSearchResponse(array $serviceResponse): array
    {
        $response = $serviceResponse['Response'] ?? $serviceResponse;

        $traceId = Arr::get($response, 'TraceId') ?? Arr::get($response, 'SessionId');

        $resultsRaw = Arr::get($response, 'HotelSearchResult')
            ?? Arr::get($response, 'Results')
            ?? Arr::get($response, 'hotels', []);

        if (is_array($resultsRaw) && isset($resultsRaw['HotelResults']) && is_array($resultsRaw['HotelResults'])) {
            $resultsRaw = $resultsRaw['HotelResults'];
        }

        $formatted = [];
        if (is_array($resultsRaw)) {
            foreach ($resultsRaw as $index => $hotel) {
                if (!is_array($hotel)) {
                    continue;
                }
                $formattedHotel = $this->formatHotelResult($hotel, (int) $index);
                if (!empty($formattedHotel)) {
                    $formatted[] = $formattedHotel;
                }
            }
        }

        return [
            'traceId' => $traceId,
            'rawResponse' => $response,
            'results' => $formatted,
        ];
    }

    private function formatHotelResult(array $hotel, int $index): array
    {
        $hotelCode = Arr::get($hotel, 'HotelCode')
            ?? Arr::get($hotel, 'HotelId')
            ?? Arr::get($hotel, 'hotelCode');

        if (!$hotelCode) {
            return [];
        }

        $resultIndex = Arr::get($hotel, 'ResultIndex')
            ?? Arr::get($hotel, 'resultIndex')
            ?? ($index + 1);

        $leadRate = $this->extractLeadRoomRate($hotel);

        return [
            'resultIndex' => $resultIndex,
            'hotelCode' => $hotelCode,
            'hotelName' => Arr::get($hotel, 'HotelName') ?? Arr::get($hotel, 'hotelName'),
            'starRating' => Arr::get($hotel, 'StarRating') ?? Arr::get($hotel, 'starRating'),
            'guestRating' => Arr::get($hotel, 'GuestRating') ?? Arr::get($hotel, 'guestRating'),
            'thumbnailUrl' => Arr::get($hotel, 'HotelPicture') ?? Arr::get($hotel, 'hotelPicture'),
            'leadRate' => $leadRate,
        ];
    }

    private function extractLeadRoomRate(array $hotel): array
    {
        $rooms = Arr::get($hotel, 'HotelRooms', Arr::get($hotel, 'Rooms', []));

        if (!is_array($rooms)) {
            return [];
        }

        foreach ($rooms as $room) {
            if (!is_array($room)) {
                continue;
            }

            $rate = $this->resolveFirstRate(
                Arr::get($room, 'RoomRate', Arr::get($room, 'Rates', []))
            );

            if (!$rate) {
                continue;
            }

            $totalFare = Arr::get($rate, 'TotalFare')
                ?? Arr::get($rate, 'OfferedFare')
                ?? Arr::get($rate, 'TotalPrice');
            $currency = Arr::get($rate, 'Currency') ?? Arr::get($rate, 'CurrencyCode');

            return [
                'roomIndex' => Arr::get($room, 'RoomIndex'),
                'roomTypeCode' => Arr::get($room, 'RoomTypeCode'),
                'roomTypeName' => Arr::get($room, 'RoomTypeName'),
                'ratePlanCode' => Arr::get($room, 'RatePlanCode'),
                'mealType' => Arr::get($room, 'MealType'),
                'totalFare' => $totalFare !== null ? (float) $totalFare : null,
                'currency' => $currency,
            ];
        }

        return [];
    }

    private function resolveFirstRate($rates): ?array
    {
        if (!is_array($rates) || empty($rates)) {
            return null;
        }

        if (Arr::isAssoc($rates)) {
            return $rates;
        }

        foreach ($rates as $rate) {
            if (is_array($rate)) {
                return $rate;
            }
        }

        return null;
    }

    /**
     * PreBook - verify price and policy
     * POST /api/v1/hotels/prebook
     */
    public function preBook(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'bookingCode' => 'required|string',
            'traceId' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();
            
            // Call TBO prebook
            $prebookResult = $this->hotelService->preBook($data['bookingCode']);
            
            // Store prebook result
            $prebook = HotelPrebook::create([
                'booking_code' => $data['bookingCode'],
                'search_session_id' => $data['traceId'] ? HotelSearchSession::where('trace_id', $data['traceId'])->first()?->id : null,
                'payload' => $prebookResult,
                'verified_total' => $prebookResult['TotalFare'] ?? 0,
                'taxes' => $prebookResult['Taxes'] ?? 0,
                'policies' => [
                    'cancellation' => $prebookResult['CancellationPolicy'] ?? null,
                    'isPriceChanged' => $prebookResult['IsPriceChanged'] ?? false,
                    'isPolicyChanged' => $prebookResult['IsPolicyChanged'] ?? false,
                ],
                'constraints' => [
                    'isPanRequired' => $prebookResult['IsPanRequired'] ?? false,
                    'isPassportRequired' => $prebookResult['IsPassportRequired'] ?? false,
                ],
                'status' => 'verified',
                'expires_at' => now()->addMinutes(30),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'prebookId' => $prebook->id,
                    'bookingCode' => $data['bookingCode'],
                    'verifiedTotal' => $prebook->verified_total,
                    'taxes' => $prebook->taxes,
                    'netAmount' => $prebookResult['NetAmount'] ?? $prebook->verified_total,
                    'policies' => $prebook->policies,
                    'constraints' => $prebook->constraints,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Hotel prebook failed', ['error' => $e->getMessage(), 'request' => $request->all()]);
            return response()->json([
                'success' => false,
                'message' => 'Hotel prebook failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Book hotel
     * POST /api/v1/hotels/book
     */
    public function book(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'prebookId' => 'required|integer|exists:hotel_prebooks,id',
            'guests' => 'required|array|min:1',
            'guests.*.title' => 'required|string|in:Mr,Mrs,Ms,Dr',
            'guests.*.firstName' => 'required|string|max:50',
            'guests.*.lastName' => 'required|string|max:50',
            'guests.*.age' => 'nullable|integer|min:0|max:120',
            'guests.*.isLeadPassenger' => 'boolean',
            'contact' => 'required|array',
            'contact.email' => 'required|email',
            'contact.phone' => 'required|string|max:20',
            'billing' => 'nullable|array',
            'isVoucherBooking' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();
            
            $prebook = HotelPrebook::findOrFail($data['prebookId']);
            
            if ($prebook->isExpired()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Prebook has expired. Please search again.',
                ], 400);
            }

            // Prepare booking payload
            $bookingPayload = [
                'bookingCode' => $prebook->booking_code,
                'guestNationality' => 'IN',
                'isVoucherBooking' => $data['isVoucherBooking'] ?? false,
                'netAmount' => $prebook->verified_total,
                'hotelRoomsDetails' => $prebook->payload['HotelRoomsDetails'] ?? [],
                'hotelPassenger' => $this->formatGuestsForTBO($data['guests']),
            ];

            // Call TBO book
            $bookingResult = $this->hotelService->book($bookingPayload);
            
            // Create booking record
            $booking = DB::transaction(function () use ($data, $prebook, $bookingResult) {
                $booking = Booking::create([
                    'type' => Booking::TYPE_HOTEL,
                    'status' => Booking::STATUS_CONFIRMED,
                    'booking_id_ext' => $bookingResult['BookingId'] ?? null,
                    'confirmation_no' => $bookingResult['ConfirmationNo'] ?? null,
                    'hotel_id' => $prebook->hotel_id,
                    'room_snapshot' => $prebook->payload,
                    'guest_json' => $data['guests'],
                    'total_price' => $prebook->verified_total,
                    'currency' => 'INR',
                    'contact_email' => $data['contact']['email'],
                    'contact_phone' => $data['contact']['phone'],
                    'is_vouchered' => $data['isVoucherBooking'] ?? false,
                    'meta' => [
                        'prebook_id' => $prebook->id,
                        'booking_result' => $bookingResult,
                        'billing' => $data['billing'] ?? null,
                    ],
                ]);

                // Update prebook status
                $prebook->update(['status' => 'completed']);

                return $booking;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'bookingId' => $booking->id,
                    'confirmationNo' => $booking->confirmation_no,
                    'status' => $booking->status,
                    'totalPrice' => $booking->total_price,
                    'currency' => $booking->currency,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Hotel booking failed', ['error' => $e->getMessage(), 'request' => $request->all()]);
            return response()->json([
                'success' => false,
                'message' => 'Hotel booking failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate voucher for hold booking
     * POST /api/v1/hotels/voucher
     */
    public function voucher(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'bookingId' => 'required|integer|exists:bookings,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $booking = Booking::findOrFail($request->bookingId);
            
            if ($booking->type !== Booking::TYPE_HOTEL) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid booking type',
                ], 400);
            }

            if (!$booking->booking_id_ext) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking ID not found',
                ], 400);
            }

            // Call TBO generate voucher
            $voucherResult = $this->hotelService->generateVoucher($booking->booking_id_ext);
            
            // Update booking
            $booking->update([
                'is_vouchered' => true,
                'meta' => array_merge($booking->meta ?? [], [
                    'voucher_result' => $voucherResult,
                    'voucher_generated_at' => now(),
                ]),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'bookingId' => $booking->id,
                    'voucherStatus' => $voucherResult['VoucherStatus'] ?? 'Generated',
                    'voucherUrl' => $voucherResult['VoucherUrl'] ?? null,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Hotel voucher generation failed', ['error' => $e->getMessage(), 'request' => $request->all()]);
            return response()->json([
                'success' => false,
                'message' => 'Hotel voucher generation failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get booking details
     * GET /api/v1/hotels/booking/{id}
     */
    public function booking(string $id): JsonResponse
    {
        try {
            $booking = Booking::with(['hotel', 'hotel.city', 'hotel.city.country'])
                ->findOrFail($id);

            if ($booking->type !== Booking::TYPE_HOTEL) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid booking type',
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $booking->id,
                    'confirmationNo' => $booking->confirmation_no,
                    'status' => $booking->status,
                    'totalPrice' => $booking->total_price,
                    'currency' => $booking->currency,
                    'isVouchered' => $booking->is_vouchered,
                    'hotel' => $booking->hotel,
                    'guests' => $booking->guest_json,
                    'roomSnapshot' => $booking->room_snapshot,
                    'contact' => [
                        'email' => $booking->contact_email,
                        'phone' => $booking->contact_phone,
                    ],
                    'createdAt' => $booking->created_at,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch booking details', ['error' => $e->getMessage(), 'bookingId' => $id]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch booking details',
            ], 500);
        }
    }

    /**
     * Get booking details by external ID
     * GET /api/v1/hotels/booking-detail?bookingId=...|confirmationNo=...|traceId=...
     */
    public function bookingDetail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'bookingId' => 'nullable|string',
            'confirmationNo' => 'nullable|string',
            'traceId' => 'nullable|string',
            'leadGuestName' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        
        if (empty(array_filter($data))) {
            return response()->json([
                'success' => false,
                'message' => 'Must provide bookingId, confirmationNo, or traceId',
            ], 400);
        }

        try {
            // Call TBO get booking details
            $bookingDetails = $this->hotelService->getBookingDetail($data);

            return response()->json([
                'success' => true,
                'data' => $bookingDetails,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch booking details from TBO', ['error' => $e->getMessage(), 'request' => $request->all()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch booking details: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send cancellation change request
     * POST /api/v1/hotels/cancel
     */
    public function cancel(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'bookingId' => 'required|integer|exists:bookings,id',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $booking = Booking::findOrFail($request->bookingId);
            
            if ($booking->type !== Booking::TYPE_HOTEL) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid booking type',
                ], 400);
            }

            if (!$booking->booking_id_ext) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking ID not found',
                ], 400);
            }

            // Call TBO send change request
            $changeResult = $this->hotelService->cancelSendChange($booking->booking_id_ext);
            
            // Create cancellation record
            $cancellation = $booking->cancellations()->create([
                'change_request_id' => $changeResult['ChangeRequestId'] ?? null,
                'status' => 'pending',
                'reason' => $request->reason,
                'requested_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'cancellationId' => $cancellation->id,
                    'changeRequestId' => $cancellation->change_request_id,
                    'status' => $cancellation->status,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Hotel cancellation request failed', ['error' => $e->getMessage(), 'request' => $request->all()]);
            return response()->json([
                'success' => false,
                'message' => 'Hotel cancellation request failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get cancellation status
     * GET /api/v1/hotels/cancel-status/{changeRequestId}
     */
    public function cancelStatus(string $changeRequestId): JsonResponse
    {
        try {
            // Call TBO get change request status
            $statusResult = $this->hotelService->cancelGetStatus($changeRequestId);
            
            // Update cancellation record if exists
            $cancellation = \App\Models\HotelCancellation::where('change_request_id', $changeRequestId)->first();
            if ($cancellation) {
                $cancellation->update([
                    'status' => strtolower($statusResult['Status'] ?? 'pending'),
                    'charge' => $statusResult['CancellationCharge'] ?? 0,
                    'refund_amount' => $statusResult['RefundAmount'] ?? 0,
                    'processed_at' => now(),
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'changeRequestId' => $changeRequestId,
                    'status' => $statusResult['Status'] ?? 'Unknown',
                    'cancellationCharge' => $statusResult['CancellationCharge'] ?? 0,
                    'refundAmount' => $statusResult['RefundAmount'] ?? 0,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get cancellation status', ['error' => $e->getMessage(), 'changeRequestId' => $changeRequestId]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get cancellation status: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a Razorpay payment order for hotel booking
     * POST /api/v1/hotels/payment/create-order
     */
    public function createPaymentOrder(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|size:3',
            'bookingId' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));

            $order = $api->order->create([
                'receipt' => $request->bookingId,
                'amount' => $request->amount * 100, // Amount in paise
                'currency' => $request->currency,
                'notes' => [
                    'booking_id' => $request->bookingId,
                    'booking_type' => 'hotel',
                ]
            ]);

            return response()->json([
                'success' => true,
                'order_id' => $order['id'],
                'amount' => $order['amount'],
                'currency' => $order['currency'],
            ]);

        } catch (\Exception $e) {
            Log::error('Razorpay order creation failed for hotel booking', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            return response()->json(['success' => false, 'message' => 'Failed to create payment order.'], 500);
        }
    }

    /**
     * Format guests data for TBO API
     */
    private function formatGuestsForTBO(array $guests): array
    {
        $formattedGuests = [];
        
        foreach ($guests as $guest) {
            $formattedGuests[] = [
                'Title' => $guest['title'],
                'FirstName' => $guest['firstName'],
                'LastName' => $guest['lastName'],
                'Age' => $guest['age'] ?? null,
                'IsLeadPassenger' => $guest['isLeadPassenger'] ?? false,
            ];
        }
        
        return $formattedGuests;
    }
}
