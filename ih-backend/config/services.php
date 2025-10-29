<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'leads' => [
        'to' => env('LEADS_TO'),
    ],

    'tbo' => [
        // Mode: soap | rest (REST recommended)
        'flight_mode' => env('TBO_FLIGHT_MODE', 'rest'),

        // Base URLs (recommended configuration - can be used to construct full endpoint URLs)
        'flight_base_url' => env('TBO_FLIGHT_BASE', 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest'),
        'booking_base_url' => env('TBO_BOOK_BASE', 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest'),
        'shared_base_url' => env('TBO_SHARED_BASE', 'https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest'),
        'hotel_base_url' => env('TBO_HOTEL_BASE', 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest'),

        // SOAP-style base endpoints (legacy - for backward compatibility)
        'flight_auth_url' => env('TBO_SHARED_AUTH', env('TBO_FLIGHT_AUTH')),
        'flight_search_url' => env('TBO_AIR_API', env('TBO_FLIGHT_SEARCH')),
        'flight_book_url' => env('TBO_AIR_BOOK', env('TBO_FLIGHT_BOOK')),

        // REST-style endpoints (recommended by TBO)
        'flight_auth_rest_url' => env('TBO_FLIGHT_AUTH_REST', 'https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest/Authenticate'),
        'flight_search_rest_url' => env('TBO_FLIGHT_SEARCH_REST', 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Search'),
        'flight_farequote_rest_url' => env('TBO_FLIGHT_FAREQUOTE_REST', 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/FareQuote'),
        'flight_farerule_rest_url' => env('TBO_FLIGHT_FARERULE_REST', 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/FareRule'),
        'flight_ssr_rest_url' => env('TBO_FLIGHT_SSR_REST', 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/SSR'),
        'flight_getcalendarfare_rest_url' => env('TBO_FLIGHT_GETCALENDARFARE_REST', 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetCalendarFare'),
        'flight_updatecalendarfareofday_rest_url' => env('TBO_FLIGHT_UPDATECALENDARFAREOF_DAY_REST', 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/UpdateCalendarFareOfDay'),
        'flight_pricerbd_rest_url' => env('TBO_FLIGHT_PRICERBD_REST', 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/PriceRBD'),
        'flight_book_rest_url' => env('TBO_FLIGHT_BOOK_REST', 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Book'),
        'flight_ticket_rest_url' => env('TBO_FLIGHT_TICKET_REST', 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Ticket'),
        'flight_booking_details_rest_url' => env('TBO_FLIGHT_BOOKING_DETAILS_REST', 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetBookingDetails'),
        'flight_sendchangerequest_rest_url' => env('TBO_FLIGHT_SENDCHANGEREQUEST_REST', 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/SendChangeRequest'),
        'flight_getchangerequeststatus_rest_url' => env('TBO_FLIGHT_GETCHANGEREQUESTSTATUS_REST', 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetChangeRequestStatus'),
        'flight_releasepnrrequest_rest_url' => env('TBO_FLIGHT_RELEASEPNRREQUEST_REST', 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/ReleasePNRRequest'),
        'flight_getcancellationcharges_rest_url' => env('TBO_FLIGHT_GETCANCELLATIONCHARGES_REST', 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetCancellationCharges'),

        // Hotel API endpoints (TBO HotelAPI_V10 - Updated to official spec)
        'hotel_auth_rest_url' => env('TBO_HOTEL_AUTH_REST', 'https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest/Authenticate'),
        'hotel_country_list_url' => env('TBO_HOTEL_COUNTRY_LIST', 'https://api.tektravels.com/SharedServices/SharedData.svc/rest/CountryList'),
        'hotel_city_list_url' => env('TBO_HOTEL_CITY_LIST', 'https://api.tektravels.com/SharedServices/SharedData.svc/rest/CityList'),
        'hotel_codes_url' => env('TBO_HOTEL_CODES', 'https://api.tektravels.com/SharedServices/SharedData.svc/rest/Hoteldetails'),
        'hotel_details_url' => env('TBO_HOTEL_DETAILS', 'https://api.tektravels.com/SharedServices/SharedData.svc/rest/Hoteldetails'),
        'hotel_search_url' => env('TBO_HOTEL_SEARCH', 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelResult'),
        'hotel_prebook_url' => env('TBO_HOTEL_PREBOOK', 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelRoom'),
        'hotel_book_url' => env('TBO_HOTEL_BOOK', 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/Book'),
        'hotel_generate_voucher_url' => env('TBO_HOTEL_GENERATE_VOUCHER', 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GenerateVoucher'),
        'hotel_booking_details_url' => env('TBO_HOTEL_BOOKING_DETAILS', 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetBookingDetail'),
        'hotel_send_change_request_url' => env('TBO_HOTEL_SEND_CHANGE_REQUEST', 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/SendChangeRequest'),
        'hotel_get_change_request_status_url' => env('TBO_HOTEL_GET_CHANGE_REQUEST_STATUS', 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetChangeRequestStatus'),

        // Legacy endpoints for backward compatibility
        'hotel_search_rest_url' => env('TBO_HOTEL_SEARCH_REST', 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelResult'),
        'hotel_book_rest_url' => env('TBO_HOTEL_BOOK_REST', 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/Book'),
        'hotel_booking_details_rest_url' => env('TBO_HOTEL_BOOKING_DETAILS_REST', 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetBookingDetail'),
        'hotel_cancel_rest_url' => env('TBO_HOTEL_CANCEL_REST', 'https://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/CancelBooking'),

        // Static API endpoints
        'static_base' => env('TBO_STATIC_BASE', 'https://api.tbotechnology.in/TBOHolidays_HotelAPI'),
        'basic_user' => env('TBO_BASIC_USER'),
        'basic_pass' => env('TBO_BASIC_PASS'),

        // Credentials
        'client_id' => env('TBO_CLIENT_ID'),
        'username' => env('TBO_USERNAME'),
        'password' => env('TBO_PASSWORD'),
        'end_user_ip' => env('TBO_ENDUSER_IP', '127.0.0.1'),
        
        // Configuration
        'use_mock' => filter_var(env('USE_MOCK', 'false'), FILTER_VALIDATE_BOOLEAN) === true,
        'enable_hotel_api' => filter_var(env('USE_TBO_HOTEL', true), FILTER_VALIDATE_BOOLEAN),
        'enable_flight_api' => filter_var(env('USE_TBO_FLIGHT', true), FILTER_VALIDATE_BOOLEAN),
        'log_channel' => env('TBO_LOG_CHANNEL', 'tbo'),
        'flight_markup_pct' => (float) env('IH_MARKUP_FLIGHT_PCT', 0),
        'hotel_markup_pct' => (float) env('IH_MARKUP_HOTEL_PCT', 0),
        'tbo_proxy' => env('TBO_PROXY'),
        'hotel_fallback_mock' => filter_var(env('TBO_HOTEL_FALLBACK_MOCK', false), FILTER_VALIDATE_BOOLEAN),
    ],

    'razorpay' => [
        'key' => env('RAZORPAY_KEY_ID'),
        'secret' => env('RAZORPAY_KEY_SECRET'),
        'webhook_secret' => env('PAYMENT_WEBHOOK_SECRET'),
    ],

];
