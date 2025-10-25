<?php

namespace Tests\Feature;

use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FlightFlowTest extends TestCase
{
    use RefreshDatabase;

    private array $headers;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.tbo.use_mock' => true]);

        $this->headers = [
            'X-Api-Key' => env('IH_API_KEY', 'IH_API_2025_DEMO_KEY'),
        ];
    }

    public function test_complete_flight_booking_flow(): void
    {
        $searchPayload = [
            'segments' => [[
                'origin' => 'DEL',
                'destination' => 'BOM',
                'departureDate' => now()->addWeek()->format('Y-m-d'),
            ]],
            'adults' => 1,
        ];

        $searchResponse = $this->withHeaders($this->headers)
            ->postJson('/api/v1/flights/search', $searchPayload)
            ->assertOk()
            ->json();

        $sessionId = $searchResponse['SessionId'];
        $firstResult = $searchResponse['Results'][0];

        $fare = $firstResult['Fare'] ?? [];
        $totalFare = (float) ($fare['TotalFare'] ?? $fare['totalFare'] ?? $fare['TotalFAre'] ?? 0);
        $currency = $fare['Currency'] ?? $fare['currency'] ?? 'INR';
        $resultIndex = $firstResult['ResultIndex'];

        $bookResponse = $this->withHeaders($this->headers)
            ->postJson('/api/v1/flights/book', [
                'sessionId' => $sessionId,
                'resultIndex' => $resultIndex,
                'contact' => ['email' => 'guest@example.test', 'phone' => '+911234567890'],
                'passengers' => [[
                    'type' => 'ADT',
                    'title' => 'Mr',
                    'firstName' => 'Test',
                    'lastName' => 'Traveller',
                ]],
                'pricing' => [
                    'totalFare' => $totalFare,
                    'currency' => $currency,
                ],
            ])
            ->assertOk()
            ->json();

        $bookingId = $bookResponse['bookingId'];
        $booking = Booking::findOrFail($bookingId);
        $this->assertSame(Booking::STATUS_ON_HOLD, $booking->status);

        $createOrder = $this->withHeaders($this->headers)
            ->postJson('/api/v1/payment/order', [
                'bookingId' => $bookingId,
                'amount' => $totalFare,
                'currency' => $currency,
            ])
            ->assertOk()
            ->json();

        $orderId = $createOrder['order_id'];

        $this->withHeaders($this->headers)
            ->postJson('/api/v1/payment/webhook', [
                'event' => 'payment.captured',
                'order_id' => $orderId,
                'payment_id' => 'pay_test_123',
                'payload' => [
                    'payment' => [
                        'entity' => [
                            'order_id' => $orderId,
                            'id' => 'pay_test_123',
                        ],
                    ],
                ],
            ])
            ->assertOk()
            ->assertJson(['status' => 'paid']);

        $booking->refresh();
        $this->assertSame(Booking::STATUS_CONFIRMED, $booking->status);
        $this->assertNotNull($booking->pnr);

        $ticketResponse = $this->withHeaders($this->headers)
            ->postJson('/api/v1/flights/ticket', [
                'bookingId' => $bookingId,
            ])
            ->assertOk()
            ->json();

        $this->assertSame($booking->pnr, $ticketResponse['pnr']);
        $this->assertSame(Booking::STATUS_CONFIRMED, $ticketResponse['status']);
    }
}
