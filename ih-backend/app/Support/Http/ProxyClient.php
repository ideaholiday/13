<?php
namespace App\Support\Http;

class ProxyClient {
    public static function applyProxy($ch): void {
        $proxy = env('TBO_PROXY');
        if (!$proxy) return;

        $parts = parse_url($proxy);
        $scheme = $parts['scheme'] ?? '';
        $host = ($parts['host'] ?? '127.0.0.1');
        $port = intval($parts['port'] ?? 1080);

        curl_setopt($ch, CURLOPT_PROXY, "{$host}:{$port}");

        if (stripos($scheme, 'socks5') === 0) {
            curl_setopt($ch, CURLOPT_PROXYTYPE, CURLPROXY_SOCKS5_HOSTNAME);
        } else {
            curl_setopt($ch, CURLOPT_PROXYTYPE, CURLPROXY_HTTP);
        }
    }
}
