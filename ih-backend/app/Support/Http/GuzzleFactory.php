<?php
namespace App\Support\Http;

use GuzzleHttp\Client;

class GuzzleFactory {
    public static function make(array $opts = []): Client {
        $proxy = env('TBO_PROXY');
        if ($proxy) {
            $opts['proxy'] = $proxy; // supports http:// and socks5://
        }
        $opts += ['timeout' => 30, 'http_errors' => false];
        return new Client($opts);
    }
}
