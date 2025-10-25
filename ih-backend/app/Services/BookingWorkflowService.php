<?php

namespace App\Services;

use App\Models\Booking;
use App\Services\TBO\AirService;
use App\Services\TBO\HotelService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class BookingWorkflowService
{
    public function __construct(
        private readonly AirService $airService,
        private readonly HotelService $hotelService,
    ) {
    }

    /**
     * Issue a flight ticket for the provided booking. Returns the ticket payload from TBO.
     */
    public function issueFlightTicket(Booking $booking, array $overrides = []): array
    {
        if ($booking->type !== Booking::TYPE_FLIGHT) {
            throw new \InvalidArgumentException('Booking is not a flight record.');
        }

        $booking->refresh();

        $meta = $booking->meta ?? [];
        $flightMeta = Arr::get($meta, 'flight', []);
        $existingTicket = Arr::get($flightMeta, 'ticket');
        if ($existingTicket) {
            return $existingTicket;
        }

        $tboBooking = Arr::get($flightMeta, 'booking', []);
        $bookingId = $overrides['bookingId'] ?? Arr::get($tboBooking, 'BookingId');
        $pnr = $overrides['pnr'] ?? Arr::get($tboBooking, 'PNR') ?? $booking->pnr;

        if (! $bookingId && ! $pnr) {
            throw new \RuntimeException('Missing TBO booking reference for ticketing.');
        }

        $ticket = $this->airService->ticket([
            'bookingId' => $bookingId,
            'pnr' => $pnr,
        ]);

        DB::transaction(function () use ($booking, $ticket, $pnr, $meta, $flightMeta) {
            $flightMeta['ticket'] = $ticket;
            $flightMeta['booking']['PNR'] = Arr::get($ticket, 'PNR', $pnr);

            $booking->forceFill([
                'status' => Booking::STATUS_CONFIRMED,
                'pnr' => Arr::get($ticket, 'PNR', $pnr),
                'meta' => array_merge($meta, ['flight' => $flightMeta]),
            ])->save();
        });

        return $ticket;
    }

    /**
     * Issue a hotel voucher/invoice for the provided booking. Returns the voucher payload from TBO.
     */
    public function issueHotelVoucher(Booking $booking, array $overrides = []): array
    {
        if ($booking->type !== Booking::TYPE_HOTEL) {
            throw new \InvalidArgumentException('Booking is not a hotel record.');
        }

        $booking->refresh();

        $meta = $booking->meta ?? [];
        $hotelMeta = Arr::get($meta, 'hotel', []);
        $existingVoucher = Arr::get($hotelMeta, 'voucher');
        if ($existingVoucher) {
            return $existingVoucher;
        }

        $bookingId = $overrides['bookingId'] ?? Arr::get($hotelMeta, 'booking.bookingId');
        $confirmationNo = $overrides['confirmationNo'] ?? Arr::get($hotelMeta, 'booking.confirmationNo') ?? $booking->pnr;

        if (! $bookingId || ! $confirmationNo) {
            throw new \RuntimeException('Missing hotel booking reference for voucher issuance.');
        }

        $voucher = $this->hotelService->generateInvoice([
            'bookingId' => $bookingId,
            'confirmationNo' => $confirmationNo,
        ]);

        DB::transaction(function () use ($booking, $voucher, $confirmationNo, $meta, $hotelMeta) {
            $hotelMeta['voucher'] = $voucher;
            $hotelMeta['booking']['confirmationNo'] = $confirmationNo;

            $booking->forceFill([
                'status' => Booking::STATUS_CONFIRMED,
                'pnr' => $confirmationNo,
                'meta' => array_merge($meta, ['hotel' => $hotelMeta]),
            ])->save();
        });

        return $voucher;
    }
}
