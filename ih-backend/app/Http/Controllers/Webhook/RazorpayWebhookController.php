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
use Razorpay\Api\Api;

class RazorpayWebhookController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly Api $razorpayApi,
    ) {
    }

    /**
     * Handle Razorpay webhook events
     * POST /api/v1/webhooks/razorpay
     */
    public function handle(Request $request): JsonResponse
    {
        try {
            // Get the webhook signature
            $webhookSignature = $request->header('X-Razorpay-Signature');
            $webhookSecret = config('services.razorpay.webhook_secret');
            
            if (!$webhookSignature || !$webhookSecret) {
                Log::warning('Razorpay webhook: Missing signature or secret');
                return $this->errorResponse('Missing webhook signature or secret', 400);
            }

            // Get the raw payload
            $payload = $request->getContent();
            
            // Verify the webhook signature
            if (!$this->verifySignature($payload, $webhookSignature, $webhookSecret)) {
                Log::warning('Razorpay webhook: Invalid signature', [
                    'signature' => $webhookSignature,
                    'payload_length' => strlen($payload)
                ]);
                return $this->errorResponse('Invalid webhook signature', 401);
            }

            // Parse the payload
            $data = json_decode($payload, true);
            if (!$data) {
                Log::error('Razorpay webhook: Invalid JSON payload');
                return $this->errorResponse('Invalid JSON payload', 400);
            }

            $event = $data['event'] ?? null;
            $entity = $data['entity'] ?? null;
            $paymentId = $data['payload']['payment']['entity']['id'] ?? null;

            if (!$event || !$entity || !$paymentId) {
                Log::warning('Razorpay webhook: Missing required fields', ['data' => $data]);
                return $this->errorResponse('Missing required fields', 400);
            }

            // Check for duplicate processing (idempotency)
            $existingLog = WebhookLog::where('webhook_id', $paymentId)
                ->where('event_type', $event)
                ->where('status', 'processed')
                ->first();

            if ($existingLog) {
                Log::info('Razorpay webhook: Duplicate event ignored', [
                    'payment_id' => $paymentId,
                    'event' => $event
                ]);
                return $this->successResponse(['message' => 'Event already processed'], [
                    'duplicate' => true,
                    'webhook_id' => $paymentId
                ]);
            }

            // Log the webhook event
            $webhookLog = WebhookLog::create([
                'webhook_id' => $paymentId,
                'event_type' => $event,
                'entity_type' => $entity,
                'provider' => 'razorpay',
                'raw_payload' => $payload,
                'status' => 'processing',
                'processed_at' => null,
            ]);

            // Process the webhook event
            $result = $this->processWebhookEvent($data, $webhookLog);

            if ($result['success']) {
                $webhookLog->update([
                    'status' => 'processed',
                    'processed_at' => now(),
                    'response_data' => $result['data'] ?? null,
                ]);

                Log::info('Razorpay webhook: Event processed successfully', [
                    'payment_id' => $paymentId,
                    'event' => $event,
                    'booking_id' => $result['booking_id'] ?? null
                ]);

                return $this->successResponse(['message' => 'Webhook processed successfully'], [
                    'webhook_id' => $paymentId,
                    'booking_id' => $result['booking_id'] ?? null
                ]);
            } else {
                $webhookLog->update([
                    'status' => 'failed',
                    'error_message' => $result['error'] ?? 'Unknown error',
                ]);

                Log::error('Razorpay webhook: Event processing failed', [
                    'payment_id' => $paymentId,
                    'event' => $event,
                    'error' => $result['error'] ?? 'Unknown error'
                ]);

                return $this->errorResponse($result['error'] ?? 'Webhook processing failed', 500);
            }

        } catch (\Exception $e) {
            Log::error('Razorpay webhook: Unexpected error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Internal server error', 500);
        }
    }

    /**
     * Verify Razorpay webhook signature
     */
    private function verifySignature(string $payload, string $signature, string $secret): bool
    {
        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Process webhook event based on event type
     */
    private function processWebhookEvent(array $data, WebhookLog $webhookLog): array
    {
        $event = $data['event'];
        $payment = $data['payload']['payment']['entity'] ?? null;

        if (!$payment) {
            return ['success' => false, 'error' => 'Payment data not found'];
        }

        $paymentId = $payment['id'];
        $bookingId = $payment['notes']['booking_id'] ?? null;

        if (!$bookingId) {
            return ['success' => false, 'error' => 'Booking ID not found in payment notes'];
        }

        try {
            DB::beginTransaction();

            $booking = Booking::find($bookingId);
            if (!$booking) {
                return ['success' => false, 'error' => 'Booking not found'];
            }

            switch ($event) {
                case 'payment.captured':
                    return $this->handlePaymentCaptured($booking, $payment, $webhookLog);
                
                case 'payment.failed':
                    return $this->handlePaymentFailed($booking, $payment, $webhookLog);
                
                case 'payment.refunded':
                    return $this->handlePaymentRefunded($booking, $payment, $webhookLog);
                
                default:
                    Log::info('Razorpay webhook: Unhandled event type', ['event' => $event]);
                    return ['success' => true, 'message' => 'Event type not handled'];
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Handle payment captured event
     */
    private function handlePaymentCaptured(Booking $booking, array $payment, WebhookLog $webhookLog): array
    {
        $booking->update([
            'payment_status' => Booking::PAYMENT_STATUS_PAID,
            'status' => Booking::STATUS_CONFIRMED,
            'payment_id' => $payment['id'],
            'payment_method' => $payment['method'] ?? 'card',
            'paid_at' => now(),
        ]);

        // Update booking meta with payment details
        $meta = $booking->meta ?? [];
        $meta['payment'] = [
            'razorpay_payment_id' => $payment['id'],
            'amount' => $payment['amount'],
            'currency' => $payment['currency'],
            'method' => $payment['method'] ?? 'card',
            'captured_at' => now()->toISOString(),
        ];
        $booking->update(['meta' => $meta]);

        DB::commit();

        return [
            'success' => true,
            'booking_id' => $booking->id,
            'data' => ['status' => 'payment_captured']
        ];
    }

    /**
     * Handle payment failed event
     */
    private function handlePaymentFailed(Booking $booking, array $payment, WebhookLog $webhookLog): array
    {
        $booking->update([
            'payment_status' => Booking::PAYMENT_STATUS_FAILED,
            'status' => Booking::STATUS_FAILED,
            'payment_id' => $payment['id'],
        ]);

        // Update booking meta with failure details
        $meta = $booking->meta ?? [];
        $meta['payment'] = [
            'razorpay_payment_id' => $payment['id'],
            'status' => 'failed',
            'error_code' => $payment['error_code'] ?? null,
            'error_description' => $payment['error_description'] ?? null,
            'failed_at' => now()->toISOString(),
        ];
        $booking->update(['meta' => $meta]);

        DB::commit();

        return [
            'success' => true,
            'booking_id' => $booking->id,
            'data' => ['status' => 'payment_failed']
        ];
    }

    /**
     * Handle payment refunded event
     */
    private function handlePaymentRefunded(Booking $booking, array $payment, WebhookLog $webhookLog): array
    {
        $booking->update([
            'payment_status' => Booking::PAYMENT_STATUS_REFUNDED,
            'status' => Booking::STATUS_CANCELLED,
        ]);

        // Update booking meta with refund details
        $meta = $booking->meta ?? [];
        $meta['refund'] = [
            'razorpay_payment_id' => $payment['id'],
            'refund_amount' => $payment['amount_refunded'] ?? 0,
            'refunded_at' => now()->toISOString(),
        ];
        $booking->update(['meta' => $meta]);

        DB::commit();

        return [
            'success' => true,
            'booking_id' => $booking->id,
            'data' => ['status' => 'payment_refunded']
        ];
    }
}