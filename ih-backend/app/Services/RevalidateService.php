<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class RevalidateService
{
    public static function trigger(array $paths): void
    {
        $url = env('NEXT_REVALIDATE_URL');
        $secret = env('NEXT_REVALIDATE_SECRET');

        if (!$url || !$secret || empty($paths)) {
            return;
        }

        try {
            Http::timeout(5)->post($url, [
                'secret' => $secret,
                'paths' => $paths,
            ]);
        } catch (\Throwable $e) {
            \Log::warning('RevalidateService failed: ' . $e->getMessage());
        }
    }
}
