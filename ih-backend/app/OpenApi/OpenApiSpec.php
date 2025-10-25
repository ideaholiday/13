<?php

namespace App\OpenApi;

use OpenApi\Annotations as OA;

/**
 * @OA\OpenApi(
 *     @OA\Info(
 *         title="iHoliday Booking API",
 *         version="1.1.0",
 *         description="REST API for Idea Holiday flight and hotel bookings. All endpoints require the `X-Api-Key` header."
 *     ),
 *     @OA\Server(
 *         url="http://127.0.0.1:8000",
 *         description="Local development"
 *     )
 * )
 */
class OpenApiSpec
{
    /**
     * @OA\Post(
     *     path="/api/v1/flights/search",
     *     tags={"Flights"},
     *     summary="Search available flights",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"segments","adults"},
     *             @OA\Property(
     *                 property="segments",
     *                 type="array",
     *                 @OA\Items(
     *                     required={"origin","destination","departureDate"},
     *                     @OA\Property(property="origin", type="string", example="DEL"),
     *                     @OA\Property(property="destination", type="string", example="BOM"),
     *                     @OA\Property(property="departureDate", type="string", format="date", example="2025-10-10")
     *                 )
     *             ),
     *             @OA\Property(property="adults", type="integer", example=1),
     *             @OA\Property(property="children", type="integer", example=0),
     *             @OA\Property(property="infants", type="integer", example=0),
     *             @OA\Property(property="cabinClass", type="string", example="Economy")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Search results",
     *         @OA\JsonContent(
     *             @OA\Property(property="SessionId", type="string", example="MOCK-SESSION-ABC123"),
     *             @OA\Property(
     *                 property="Results",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="ResultIndex", type="integer", example=1),
     *                     @OA\Property(property="Fare", type="object"),
     *                     @OA\Property(property="Segments", type="array", @OA\Items(type="object"))
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function flightSearch(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/v1/flights/book",
     *     tags={"Flights"},
     *     summary="Hold seats for the selected flight",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"sessionId","resultIndex","contact","passengers","pricing"},
     *             @OA\Property(property="sessionId", type="string", example="MOCK-SESSION-ABC123"),
     *             @OA\Property(property="resultIndex", type="integer", example=1),
     *             @OA\Property(property="contact", type="object",
     *                 @OA\Property(property="email", type="string", format="email", example="guest@example.com"),
     *                 @OA\Property(property="phone", type="string", example="+911234567890")
     *             ),
     *             @OA\Property(property="passengers", type="array",
     *                 @OA\Items(
     *                     required={"firstName","lastName"},
     *                     @OA\Property(property="type", type="string", example="ADT"),
     *                     @OA\Property(property="firstName", type="string", example="Test"),
     *                     @OA\Property(property="lastName", type="string", example="Passenger")
     *                 )
     *             ),
     *             @OA\Property(property="pricing", type="object",
     *                 @OA\Property(property="totalFare", type="number", example=6200),
     *                 @OA\Property(property="currency", type="string", example="INR")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Hold created")
     * )
     */
    public function flightBook(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/v1/flights/ticket",
     *     tags={"Flights"},
     *     summary="Issue flight ticket after successful payment",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"bookingId"},
     *             @OA\Property(property="bookingId", type="integer", example=1001)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Ticket payload returned")
     * )
     */
    public function flightTicket(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/v1/hotels/search",
     *     tags={"Hotels"},
     *     summary="Search available hotels",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"cityId","cityName","checkIn","checkOut"},
     *             @OA\Property(property="cityId", type="string", example="GOI"),
     *             @OA\Property(property="cityName", type="string", example="Goa"),
     *             @OA\Property(property="checkIn", type="string", format="date", example="2025-11-15"),
     *             @OA\Property(property="checkOut", type="string", format="date", example="2025-11-18"),
     *             @OA\Property(property="currency", type="string", example="INR"),
     *             @OA\Property(property="rooms", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="adults", type="integer", example=2),
     *                     @OA\Property(property="children", type="integer", example=0)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Hotel results returned")
     * )
     */
    public function hotelSearch(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/v1/hotels/book",
     *     tags={"Hotels"},
     *     summary="Hold hotel rooms for the selected offer",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"sessionId","resultIndex","hotelCode","rooms","guests","contact"},
     *             @OA\Property(property="sessionId", type="string", example="MOCK-HOTEL-XYZ789"),
     *             @OA\Property(property="resultIndex", type="integer", example=1),
     *             @OA\Property(property="hotelCode", type="string", example="HOTEL123"),
     *             @OA\Property(property="rooms", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="guests", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="contact", type="object",
     *                 @OA\Property(property="email", type="string", example="guest@example.com"),
     *                 @OA\Property(property="phone", type="string", example="+911234567890")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Hotel hold created")
     * )
     */
    public function hotelBook(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/v1/hotels/voucher",
     *     tags={"Hotels"},
     *     summary="Generate hotel voucher after payment",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"bookingId"},
     *             @OA\Property(property="bookingId", type="integer", example=2042),
     *             @OA\Property(property="confirmationNo", type="string", example="CNF12345")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Voucher ready")
     * )
     */
    public function hotelVoucher(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/v1/payment/order",
     *     tags={"Payments"},
     *     summary="Create payment order for a booking",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"bookingId","amount"},
     *             @OA\Property(property="bookingId", type="integer", example=1201),
     *             @OA\Property(property="amount", type="number", example=6200),
     *             @OA\Property(property="currency", type="string", example="INR")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Order created")
     * )
     */
    public function paymentOrder(): void
    {
    }

    /**
     * @OA\Post(
     *     path="/api/v1/payment/webhook",
     *     tags={"Payments"},
     *     summary="Webhook endpoint for payment provider",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"event","order_id","payment_id"},
     *             @OA\Property(property="event", type="string", example="payment.captured"),
     *             @OA\Property(property="order_id", type="string", example="order_abc123"),
     *             @OA\Property(property="payment_id", type="string", example="pay_xyz987"),
     *             @OA\Property(property="payload", type="object")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Webhook processed")
     * )
     */
    public function paymentWebhook(): void
    {
    }
}
