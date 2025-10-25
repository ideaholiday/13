<?php

namespace App\Services\TBO;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Throwable;

class SoapClient12
{
    private const MAX_ATTEMPTS = 3;
    private const RETRY_DELAY_MS = 250;

    private Client $http;
    private LoggerInterface $logger;
    private array $config;

    public function __construct(?Client $client = null, ?LoggerInterface $logger = null)
    {
        $this->config = config('services.tbo', []);

        $this->http = $client ?? new Client([
            'timeout' => 45,
            'connect_timeout' => 15,
            'decode_content' => true,
        ]);

        $logPath = storage_path('logs/tbo');
        if (! is_dir($logPath)) {
            @mkdir($logPath, 0775, true);
        }

        $channel = Arr::get($this->config, 'log_channel', 'tbo');
        $this->logger = $logger ?? Log::channel($channel);
    }

    public function request(string $action, string $xml, string $url, ?string $soapHeader = null): array
    {
        if ($url === '') {
            throw new InvalidArgumentException('SOAP endpoint URL is required.');
        }

        $attempt = 0;
        $lastException = null;

        while ($attempt < self::MAX_ATTEMPTS) {
            $attempt++;
            $envelope = $this->prepareEnvelope($action, $xml, $url, $soapHeader);

            $this->logPayload('request', $url, $action, $envelope, $attempt);

            try {
                $options = [
                    'headers' => [
                        // For SOAP 1.2 servers, include the action parameter in Content-Type.
                        'Content-Type' => 'application/soap+xml; charset=UTF-8; action="'.$action.'"',
                        'Accept-Encoding' => 'gzip, deflate',
                        // Some servers still expect SOAPAction header even for SOAP 1.2; keep it for compatibility.
                        'SOAPAction' => $action,
                    ],
                    'body' => $envelope,
                ];
                $proxy = $this->getProxyFor($url);
                if ($proxy) {
                    $options['proxy'] = $proxy;
                }

                $response = $this->http->post($url, $options);

                $body = (string) $response->getBody();
                $this->logPayload('response', $url, $action, $body, $attempt, $response->getStatusCode());

                $parsed = $this->convertXmlToArray($body);
                $parsed['__raw'] = $body;
                return $parsed;
            } catch (Throwable $exception) {
                $lastException = $exception;
                $this->logException($url, $action, $exception, $attempt);

                if (! $this->shouldRetry($exception, $attempt)) {
                    throw new RuntimeException(
                        'SOAP request failed: '.$exception->getMessage(),
                        (int) $exception->getCode(),
                        $exception,
                    );
                }

                usleep(self::RETRY_DELAY_MS * 1000 * $attempt);
            }
        }

        throw new RuntimeException('SOAP request failed after maximum retry attempts.', previous: $lastException);
    }

    private function prepareEnvelope(string $action, string $xml, string $url, ?string $soapHeader): string
    {
        $trimmed = trim($xml);

        if ($trimmed === '') {
            throw new InvalidArgumentException('SOAP XML payload cannot be empty.');
        }

        $wsaHeader = $this->buildWsAddressingHeader($action, $url, false);
        $customHeader = $soapHeader ?? '';

        if ($this->containsSoapEnvelope($trimmed)) {
            $headerContent = $this->containsWsAddressing($trimmed)
                ? $customHeader
                : $wsaHeader.$customHeader;

            return $this->injectHeaderContent($trimmed, $headerContent);
        }

        return $this->wrapWithEnvelope($trimmed, $action, $url, $customHeader);
    }

    private function containsSoapEnvelope(string $payload): bool
    {
        return stripos($payload, '<soap:Envelope') !== false
            || stripos($payload, '<soap12:Envelope') !== false
            || stripos($payload, '<Envelope') !== false;
    }

    private function containsWsAddressing(string $payload): bool
    {
        return stripos($payload, 'http://www.w3.org/2005/08/addressing') !== false
            || stripos($payload, 'xmlns:wsa=') !== false;
    }

    private function injectHeaderContent(string $payload, string $headerContent): string
    {
        if ($headerContent === null || $headerContent === '') {
            return $payload;
        }

        if (preg_match('/<soap12:Header(.*?)>/i', $payload)) {
            return preg_replace(
                '/<soap12:Header(.*?)>/i',
                '<soap12:Header$1>'.$headerContent,
                $payload,
                1
            );
        }

        if (preg_match('/<soap:Header(.*?)>/i', $payload)) {
            return preg_replace(
                '/<soap:Header(.*?)>/i',
                '<soap:Header$1>'.$headerContent,
                $payload,
                1
            );
        }

        $updated = preg_replace(
            '/<soap12:Body>/i',
            '<soap12:Header>'.$headerContent.'</soap12:Header><soap12:Body>',
            $payload,
            1
        );

        if ($updated !== null && $updated !== $payload) {
            return $updated;
        }

        return preg_replace(
            '/<soap:Body>/i',
            '<soap:Header>'.$headerContent.'</soap:Header><soap:Body>',
            $payload,
            1
        ) ?? $payload;
    }

    private function wrapWithEnvelope(string $body, string $action, string $url, string $customHeader): string
    {
        $header = $this->buildWsAddressingHeader($action, $url, true).$customHeader;

        return <<<XML
<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                 xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"
                 xmlns:wsa="http://www.w3.org/2005/08/addressing">
    <soap12:Header>
        {$header}
    </soap12:Header>
    <soap12:Body>
        {$body}
    </soap12:Body>
</soap12:Envelope>
XML;
    }

    private function buildWsAddressingHeader(string $action, string $url, bool $envelopeHasNamespace): string
    {
        $messageId = 'urn:uuid:'.(string) Str::uuid();
        $namespaceAttr = $envelopeHasNamespace ? '' : ' xmlns:wsa="http://www.w3.org/2005/08/addressing"';

        return <<<XML
<wsa:Action{$namespaceAttr}>{$action}</wsa:Action>
<wsa:MessageID>{$messageId}</wsa:MessageID>
<wsa:To>{$url}</wsa:To>
<wsa:ReplyTo>
    <wsa:Address>http://www.w3.org/2005/08/addressing/anonymous</wsa:Address>
</wsa:ReplyTo>
XML;
    }

    private function convertXmlToArray(string $xml): array
    {
        $trimmed = trim($xml);

        if ($trimmed === '') {
            return [];
        }

        $simpleXml = @simplexml_load_string($trimmed, 'SimpleXMLElement', LIBXML_NOCDATA);

        if ($simpleXml === false) {
            throw new RuntimeException('Failed to parse SOAP response XML.');
        }

        $decoded = json_decode(json_encode($simpleXml, JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR);

        return is_array($decoded) ? $decoded : [];
    }

    private function shouldRetry(Throwable $exception, int $attempt): bool
    {
        if ($attempt >= self::MAX_ATTEMPTS) {
            return false;
        }

        if ($exception instanceof ConnectException) {
            return true;
        }

        if ($exception instanceof RequestException) {
            $response = $exception->getResponse();
            if ($response) {
                $status = $response->getStatusCode();
                return $status === 408 || $status >= 500;
            }

            return true;
        }

        if ($exception instanceof GuzzleException) {
            return true;
        }

        return false;
    }

    private function logPayload(string $type, string $endpoint, string $action, string $payload, int $attempt, ?int $status = null): void
    {
        $masked = $this->maskSecrets($payload);

        $context = [
            'type' => $type,
            'endpoint' => $endpoint,
            'action' => $action,
            'attempt' => $attempt,
        ];

        if ($status !== null) {
            $context['status'] = $status;
        }

        $message = strlen($masked) > 4000 ? substr($masked, 0, 4000).'... [truncated]' : $masked;

        $this->logger->debug($message, $context);
    }

    private function logException(string $endpoint, string $action, Throwable $exception, int $attempt): void
    {
        $this->logger->warning($exception->getMessage(), [
            'type' => 'request_error',
            'endpoint' => $endpoint,
            'action' => $action,
            'attempt' => $attempt,
        ]);
    }

    private function maskSecrets(string $payload): string
    {
        if ($payload === '') {
            return $payload;
        }

        $masks = [
            '/<UserName>(.*?)<\/UserName>/i' => '<UserName>***</UserName>',
            '/<Password>(.*?)<\/Password>/i' => '<Password>***</Password>',
            '/<hot:UserName>(.*?)<\/hot:UserName>/i' => '<hot:UserName>***</hot:UserName>',
            '/<hot:Password>(.*?)<\/hot:Password>/i' => '<hot:Password>***</hot:Password>',
            '/<ClientID>(.*?)<\/ClientID>/i' => '<ClientID>***</ClientID>',
            '/<APIKey>(.*?)<\/APIKey>/i' => '<APIKey>***</APIKey>',
        ];

        $masked = preg_replace(array_keys($masks), array_values($masks), $payload) ?? $payload;

        $secrets = array_filter([
            Arr::get($this->config, 'username'),
            Arr::get($this->config, 'password'),
            config('services.ih.api_key'),
        ]);

        foreach ($secrets as $value) {
            if ($value) {
                $masked = str_replace((string) $value, '***', $masked);
            }
        }

        return $masked;
    }

    private function getProxyFor(string $url): ?string
    {
        $host = parse_url($url, PHP_URL_HOST) ?: '';
        // Read from config first, fallback to env
        $proxy = Arr::get($this->config, 'tbo_proxy');
        if (!$proxy) {
            $proxy = env('TBO_PROXY');
        }
        if (!$proxy) {
            return null; // no proxy configured
        }
        // Apply proxy only for TBO-related hosts
        $isTboHost = preg_match('/travelboutiqueonline\.(com|in)$/i', $host) ||
                     preg_match('/tektravels\.(com|in)$/i', $host) ||
                     stripos($host, 'tboapi.') !== false ||
                     stripos($host, 'api.tektravels.') !== false ||
                     stripos($host, 'booking.tektravels.') !== false ||
                     stripos($host, 'booking.travelboutiqueonline.') !== false ||
                     stripos($host, 'hotelbooking.travelboutiqueonline.') !== false ||
                     stripos($host, 'api.travelboutiqueonline.') !== false;
        return $isTboHost ? $proxy : null;
    }
}
