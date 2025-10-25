<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\TBO\HotelService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class HotelController extends Controller
{
    public function __construct(private readonly HotelService $hotelService)
    {
    }

    /**
     * Search hotels
     * POST /api/v1/hotels/search
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // Accept either cityId or cityCode/cityName
            'cityId' => 'nullable|string|max:10',
            'cityCode' => 'required_without:cityId|nullable|string|max:10',
            'cityName' => 'nullable|string|max:64',
            'checkInDate' => 'required|date|after:yesterday',
            'checkOutDate' => 'required|date|after:checkInDate',
            'rooms' => 'required|array|min:1',
            'rooms.*.adults' => 'required|integer|min:1|max:6',
            'rooms.*.children' => 'nullable|integer|min:0|max:4',
            'rooms.*.childAges' => 'nullable|array',
            'nationality' => 'nullable|string|size:2',
            'currency' => 'nullable|string|size:3',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $payload = [
                'cityId' => $request->input('cityId'),
                'cityCode' => $request->filled('cityCode') ? strtoupper($request->input('cityCode')) : null,
                'cityName' => $request->input('cityName'),
                'checkInDate' => $request->input('checkInDate'),
                'checkOutDate' => $request->input('checkOutDate'),
                'rooms' => $request->input('rooms'),
                'nationality' => $request->input('nationality', 'IN'),
                'currency' => $request->input('currency', 'INR'),
            ];

            Log::info('Hotel search request', ['payload' => $payload]);

            $results = $this->hotelService->hotelSearch($payload);

            Log::info('Hotel search response', ['count' => count($results['results'] ?? [])]);

            return response()->json([
                'success' => true,
                'data' => $results
            ]);
        } catch (\Exception $e) {
            Log::error('Hotel search error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Hotel search failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available rooms for a hotel
     * POST /api/v1/hotels/rooms
     */
    public function rooms(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resultIndex' => 'required|integer',
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

            $result = $this->hotelService->availableRooms($payload);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Hotel rooms error', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get hotel rooms: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get room pricing
     * POST /api/v1/hotels/pricing
     */
    public function pricing(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resultIndex' => 'required|integer',
            'roomIndex' => 'required|integer',
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
                'roomIndex' => $request->input('roomIndex'),
                'traceId' => $request->input('traceId'),
            ];

            $result = $this->hotelService->availabilityAndPricing($payload);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Hotel pricing error', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get hotel pricing: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Book hotel
     * POST /api/v1/hotels/book
     */
    public function book(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resultIndex' => 'required|integer',
            'roomIndex' => 'required|integer',
            'traceId' => 'required|string',
            'guests' => 'required|array|min:1',
            'guests.*.title' => 'required|in:Mr,Ms,Mrs,Dr,Mstr,Miss',
            'guests.*.firstName' => 'required|string|max:50',
            'guests.*.lastName' => 'required|string|max:50',
            'guests.*.type' => 'required|in:ADT,CHD',
            'guests.*.age' => 'nullable|integer|min:0|max:120',
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
                'roomIndex' => $request->input('roomIndex'),
                'traceId' => $request->input('traceId'),
                'guests' => $request->input('guests'),
                'contactInfo' => $request->input('contactInfo'),
            ];

            $result = $this->hotelService->hotelBook($payload);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Hotel booking error', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Hotel booking failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get booking voucher/details
     * POST /api/v1/hotels/booking-details
     */
    public function bookingDetails(Request $request)
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
                'bookingId' => $request->input('bookingId'),
            ];

            $result = $this->hotelService->bookingDetail($payload);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Hotel booking details error', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get booking details: ' . $e->getMessage()
            ], 500);
        }
    }
}
