<x-mail::message>
# Booking Confirmation

Hello {{ $booking->contact_email }},

Thank you for booking with Idea Holiday! Your flight is confirmed.

**Booking ID:** {{ $booking->id }}

We're excited to have you on board.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
