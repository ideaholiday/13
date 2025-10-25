<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Booking;
use App\Models\WebhookLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TboWebhookController extends Controller
{
    use ApiResponseTrait;

    /**
     * Handle TBO webhook events
     * POST /api/v1/webhooks/tbo
     */
    public function handle(Request $request): JsonResponse
    {
        try {
            // Get the webhook signature
            $webhookSignature = $request->header('X-TBO-Signature');
            $webhookSecret = config('services.tbo.webhook_secret');
            
            if (!$webhookSignature || !$webhookSecret) {
                Log::warning('TBO webhook: Missing signature or secret');
                return $this->errorResponse('Missing webhook signature or secret', 400);
            }

            // Get the raw payload
            $payload = $request->getContent();
            
            // Verify the webhook signature
            if (!$this->verifySignature($payload, $webhookSignature, $webhookSecret)) {
                Log::warning('TBO webhook: Invalid signature', [
                    'signature' => $webhookSignature,
                    'payload_length' => strlen($payload)
                ]);
                return $this->errorResponse('Invalid webhook signature', 401);
            }

            // Parse the payload
            $data = json_decode($payload, true);
            if (!$data) {
                Log::error('TBO webhook: Invalid JSON payload');
                return $this->errorResponse('Invalid JSON payload', 400);
            }

            $eventType = $data['eventType'] ?? null;
            $bookingId = $data['bookingId'] ?? null;
            $pnr = $data['pnr'] ?? null;

            if (!$eventType || (!$bookingId && !$pnr)) {
                Log::warning('TBO webhook: Missing required fields', ['data' => $data]);
                return $this->errorResponse('Missing required fields', 400);
            }

            // Find booking by ID or PNR
            $booking = null;
            if ($bookingId) {
                $booking = Booking::find($bookingId);
            } elseif ($pnr) {
                $booking = Booking::where('pnr', $pnr)->first();
            }

            if (!$booking) {
                Log::warning('TBO webhook: Booking not found', [
                    'booking_id' => $bookingId,
                    'pnr' => $pnr
                ]);
                return $this->errorResponse('Booking not found', 404);
            }

            // Check for duplicate processing (idempotency)
            $webhookId = $data['webhookId'] ?? ($bookingId . '_' . $eventType . '_' . time());
            $existingLog = WebhookLog::where('webhook_id', $webhookId)
                ->where('event_type', $eventType)
                ->where('status', 'processed')
                ->first();

            if ($existingLog) {
                Log::info('TBO webhook: Duplicate event ignored', [
                    'webhook_id' => $webhookId,
                    'event_type' => $eventType
                ]);
                return $this->successResponse(['message' => 'Event already processed'], [
                    'duplicate' => true,
                    'webhook_id' => $webhookId
                ]);
            }

            // Log the webhook event
            $webhookLog = WebhookLog::create([
                'webhook_id' => $webhookId,
                'event_type' => $eventType,
                'entity_type' => 'booking',
                'provider' => 'tbo',
                'raw_payload' => $payload,
                'status' => 'processing',
                'processed_at' => null,
            ]);

            // Process the webhook event
            $result = $this->processWebhookEvent($data, $booking, $webhookLog);

            if ($result['success']) {
                $webhookLog->update([
                    'status' => 'processed',
                    'processed_at' => now(),
                    'response_data' => $result['data'] ?? null,
                ]);

                Log::info('TBO webhook: Event processed successfully', [
                    'webhook_id' => $webhookId,
                    'event_type' => $eventType,
                    'booking_id' => $booking->id
                ]);

                return $this->successResponse(['message' => 'Webhook processed successfully'], [
                    'webhook_id' => $webhookId,
                    'booking_id' => $booking->id
                ]);
            } else {
                $webhookLog->update([
                    'status' => 'failed',
                    'error_message' => $result['error'] ?? 'Unknown error',
                ]);

                Log::error('TBO webhook: Event processing failed', [
                    'webhook_id' => $webhookId,
                    'event_type' => $eventType,
                    'error' => $result['error'] ?? 'Unknown error'
                ]);

                return $this->errorResponse($result['error'] ?? 'Webhook processing failed', 500);
            }

        } catch (\Exception $e) {
            Log::error('TBO webhook: Unexpected error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Internal server error', 500);
        }
    }

    /**
     * Verify TBO webhook signature
     */
    private function verifySignature(string $payload, string $signature, string $secret): bool
    {
        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Process webhook event based on event type
     */
    private function processWebhookEvent(array $data, Booking $booking, WebhookLog $webhookLog): array
    {
        $eventType = $data['eventType'];

        try {
            DB::beginTransaction();

            switch ($eventType) {
                case 'booking.confirmed':
                    return $this->handleBookingConfirmed($booking, $data, $webhookLog);
                
                case 'booking.cancelled':
                    return $this->handleBookingCancelled($booking, $data, $webhookLog);
                
                case 'booking.failed':
                    return $this->handleBookingFailed($booking, $data, $webhookLog);
                
                case 'ticket.issued':
                    return $this->handleTicketIssued($booking, $data, $webhookLog);
                
                case 'ticket.cancelled':
                    return $this->handleTicketCancelled($booking, $data, $webhookLog);
                
                default:
                    Log::info('TBO webhook: Unhandled event type', ['event_type' => $eventType]);
                    return ['success' => true, 'message' => 'Event type not handled'];
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Handle booking confirmed event
     */
    private function handleBookingConfirmed(Booking $booking, array $data, WebhookLog $webhookLog): array
    {
        $booking->update([
            'status' => Booking::STATUS_CONFIRMED,
            'pnr' => $data['pnr'] ?? $booking->pnr,
            'confirmed_at' => now(),
        ]);

        // Update booking meta with confirmation details
        $meta = $booking->meta ?? [];
        $meta['tbo_confirmation'] = [
            'pnr' => $data['pnr'] ?? null,
            'booking_reference' => $data['bookingReference'] ?? null,
            'confirmed_at' => now()->toISOString(),
            'ticket_deadline' => $data['ticketDeadline'] ?? null,
        ];
        $booking->update(['meta' => $meta]);

        DB::commit();

        return [
            'success' => true,
            'booking_id' => $booking->id,
            'data' => ['status' => 'booking_confirmed']
        ];
    }

    /**
     * Handle booking cancelled event
     */
    private function handleBookingCancelled(Booking $booking, array $data, WebhookLog $webhookLog): array
    {
        $booking->update([
            'status' => Booking::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ]);

        // Update booking meta with cancellation details
        $meta = $booking->meta ?? [];
        $meta['tbo_cancellation'] = [
            'cancellation_reason' => $data['cancellationReason'] ?? null,
            'refund_amount' => $data['refundAmount'] ?? 0,
            'cancelled_at' => now()->toISOString(),
        ];
        $booking->update(['meta' => $meta]);

        DB::commit();

        return [
            'success' => true,
            'booking_id' => $booking->id,
            'data' => ['status' => 'booking_cancelled']
        ];
    }

    /**
     * Handle booking failed event
     */
    private function handleBookingFailed(Booking $booking, array $data, WebhookLog $webhookLog): array
    {
        $booking->update([
            'status' => Booking::STATUS_FAILED,
            'failed_at' => now(),
        ]);

        // Update booking meta with failure details
        $meta = $booking->meta ?? [];
        $meta['tbo_failure'] = [
            'failure_reason' => $data['failureReason'] ?? null,
            'error_code' => $data['errorCode'] ?? null,
            'failed_at' => now()->toISOString(),
        ];
        $booking->update(['meta' => $meta]);

        DB::commit();

        return [
            'success' => true,
            'booking_id' => $booking->id,
            'data' => ['status' => 'booking_failed']
        ];
    }

    /**
     * Handle ticket issued event
     */
    private function handleTicketIssued(Booking $booking, array $data, WebhookLog $webhookLog): array
    {
        $booking->update([
            'status' => Booking::STATUS_CONFIRMED,
            'ticket_number' => $data['ticketNumber'] ?? null,
            'ticketed_at' => now(),
        ]);

        // Update booking meta with ticket details
        $meta = $booking->meta ?? [];
        $meta['tbo_ticket'] = [
            'ticket_number' => $data['ticketNumber'] ?? null,
            'ticket_url' => $data['ticketUrl'] ?? null,
            'issued_at' => now()->toISOString(),
        ];
        $booking->update(['meta' => $meta]);

        DB::commit();

        return [
            'success' => true,
            'booking_id' => $booking->id,
            'data' => ['status' => 'ticket_issued']
        ];
    }

    /**
     * Handle ticket cancelled event
     */
    private function handleTicketCancelled(Booking $booking, array $data, WebhookLog $webhookLog): array
    {
        $booking->update([
            'status' => Booking::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ]);

        // Update booking meta with ticket cancellation details
        $meta = $booking->meta ?? [];
        $meta['tbo_ticket_cancellation'] = [
            'ticket_number' => $data['ticketNumber'] ?? null,
            'cancellation_reason' => $data['cancellationReason'] ?? null,
            'refund_amount' => $data['refundAmount'] ?? 0,
            'cancelled_at' => now()->toISOString(),
        ];
        $booking->update(['meta' => $meta]);

        DB::commit();

        return [
            'success' => true,
            'booking_id' => $booking->id,
            'data' => ['status' => 'ticket_cancelled']
        ];
    }
}