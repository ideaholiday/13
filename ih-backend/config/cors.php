<?php

return [
    // CORS for API + Sanctum cookie route in local/dev
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Allow all HTTP methods (GET/POST/PUT/PATCH/DELETE/OPTIONS) in dev
    'allowed_methods' => ['*'],

    // Frontend dev origins
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
    ],

    'allowed_origins_patterns' => [],

    // Accept all headers in dev to avoid preflight rejections
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    // Cache preflight for an hour
    'max_age' => 3600,

    // Keep credentials off unless you are using cookies/session from the browser
    'supports_credentials' => false,
];