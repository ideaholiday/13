<?php
namespace App\Support\Http;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Config;

class GuzzleFactory {
    public static function make(array $opts = []): Client {
        // Read proxy from config (works with cached config)
        $proxy = Config::get('services.tbo.tbo_proxy') ?? env('TBO_PROXY');
        if ($proxy) {
            $opts['proxy'] = $proxy; // supports http:// and socks5://
            $opts['curl'][CURLOPT_PROXYTYPE] = CURLPROXY_SOCKS5_HOSTNAME;
        }
        $opts += ['timeout' => 30, 'http_errors' => false];
        return new Client($opts);
    }
}
