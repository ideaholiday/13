<?php

namespace App\Services\TBO;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Throwable;

class SoapXmlClient
{
    private const MAX_ATTEMPTS = 3;
    private const INITIAL_DELAY_MS = 250;

    private Client $http;
    private LoggerInterface $logger;
    private array $config;

    public function __construct(?Client $client = null, ?LoggerInterface $logger = null)
    {
        $this->config = config('services.tbo', []);
        $this->http = $client ?? new Client([
            'timeout' => 45,
            'connect_timeout' => 15,
        ]);

        $channel = $this->config['log_channel'] ?? 'tbo';
        $logPath = storage_path('logs/tbo');
        if (! is_dir($logPath)) {
            @mkdir($logPath, 0775, true);
        }

        $this->logger = $logger ?? Log::channel($channel);
    }

    public function sendHotelRequest(string $action, string $body, ?string $endpoint = null): string
    {
        $endpoint ??= $this->config['hotel_search_url'] ?? '';

        if ($endpoint === '') {
            throw new RuntimeException('TBO hotel endpoint is not configured.');
        }

        $credentialsHeader = $this->buildCredentialsHeader();

        return $this->dispatch($endpoint, $action, $body, $credentialsHeader);
    }

    public function sendHotelBookingRequest(string $action, string $body): string
    {
        $endpoint = $this->config['hotel_book_url'] ?? $this->config['hotel_search_url'] ?? '';

        if ($endpoint === '') {
            throw new RuntimeException('TBO hotel booking endpoint is not configured.');
        }

        return $this->dispatch($endpoint, $action, $body, $this->buildCredentialsHeader());
    }

    public function sendFlightAuthRequest(string $action, string $body): string
    {
        $endpoint = $this->config['flight_auth_url'] ?? '';

        if ($endpoint === '') {
            throw new RuntimeException('TBO flight auth endpoint is not configured.');
        }

        return $this->dispatch($endpoint, $action, $body);
    }

    public function sendFlightRequest(string $action, string $body, bool $forBooking = false): string
    {
        $endpoint = $forBooking
            ? ($this->config['flight_book_url'] ?? '')
            : ($this->config['flight_search_url'] ?? '');

        if ($endpoint === '') {
            throw new RuntimeException('TBO flight endpoint is not configured.');
        }

        return $this->dispatch($endpoint, $action, $body);
    }

    /**
     * @param  string|null  $additionalHeader  | Raw XML to inject inside the SOAP header.
     */
    protected function dispatch(string $endpoint, string $action, string $body, ?string $additionalHeader = null): string
    {
        $attempt = 0;
        $error = null;

        while ($attempt < self::MAX_ATTEMPTS) {
            $attempt++;
            $requestXml = $this->buildEnvelope($body, $action, $endpoint, $additionalHeader);
            $this->logPayload('request', $endpoint, $action, $requestXml, $attempt);

            try {
                $response = $this->http->post($endpoint, [
                    'headers' => [
                        'Content-Type' => 'application/soap+xml; charset=UTF-8',
                        'SOAPAction' => $action,
                        'Accept-Encoding' => 'gzip, deflate',
                    ],
                    'body' => $requestXml,
                ]);

                $rawBody = (string) $response->getBody();
                $decodedBody = $this->decodeBody($rawBody, $response->getHeaderLine('Content-Encoding'));

                $this->logPayload('response', $endpoint, $action, $decodedBody, $attempt, $response->getStatusCode());

                if ($this->shouldRetryForBody($decodedBody)) {
                    throw new RuntimeException('TBO returned SystemErr status. Retrying...');
                }

                return $decodedBody;
            } catch (Throwable $exception) {
                $error = $exception;
                $this->logPayload('request_error', $endpoint, $action, $exception->getMessage(), $attempt);

                if (! $this->shouldRetryForException($exception) || $attempt >= self::MAX_ATTEMPTS) {
                    throw new RuntimeException($exception->getMessage(), (int) $exception->getCode(), $exception);
                }

                usleep(self::INITIAL_DELAY_MS * 1000 * $attempt);
            }
        }

        throw new RuntimeException('Unable to process SOAP request.', previous: $error);
    }

    protected function buildEnvelope(string $body, string $action, string $to, ?string $additionalHeader = null): string
    {
        $messageId = 'urn:uuid:'.(string) Str::uuid();
        $headerXml = <<<XML
<wsa:Action>{$action}</wsa:Action>
<wsa:MessageID>{$messageId}</wsa:MessageID>
<wsa:To>{$to}</wsa:To>
<wsa:ReplyTo>
    <wsa:Address>http://www.w3.org/2005/08/addressing/anonymous</wsa:Address>
</wsa:ReplyTo>
XML;

        if ($additionalHeader) {
            $headerXml .= $additionalHeader;
        }

        return <<<XML
<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                 xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"
                 xmlns:wsa="http://www.w3.org/2005/08/addressing">
    <soap12:Header>
        {$headerXml}
    </soap12:Header>
    <soap12:Body>
        {$body}
    </soap12:Body>
</soap12:Envelope>
XML;
    }

    protected function buildCredentialsHeader(): string
    {
        $username = Arr::get($this->config, 'username');
        $password = Arr::get($this->config, 'password');

        return <<<XML
<hot:Credentials xmlns:hot="http://TekTravel/HotelApi/">
    <hot:UserName>{$username}</hot:UserName>
    <hot:Password>{$password}</hot:Password>
</hot:Credentials>
XML;
    }

    protected function decodeBody(string $rawBody, ?string $encoding): string
    {
        $decoded = $rawBody;

        if ($encoding && stripos($encoding, 'gzip') !== false) {
                $decoded = function_exists('gzdecode') ? @gzdecode($rawBody) : false;
                if ($decoded === false) {
                    $decoded = $rawBody;
                }
        } elseif ($encoding && stripos($encoding, 'deflate') !== false) {
            $decoded = function_exists('gzuncompress') ? @gzuncompress($rawBody) : false;
            if ($decoded === false) {
                $decoded = function_exists('gzinflate') ? @gzinflate($rawBody) : false;
            }
            if ($decoded === false) {
                $decoded = $rawBody;
            }
        }

        return $decoded;
    }

    protected function shouldRetryForException(Throwable $exception): bool
    {
        if ($exception instanceof GuzzleException && method_exists($exception, 'getResponse')) {
            $response = $exception->getResponse();
            if ($response) {
                $status = $response->getStatusCode();
                if ($status === 408 || $status >= 500) {
                    return true;
                }

                $body = $this->decodeBody((string) $response->getBody(), $response->getHeaderLine('Content-Encoding'));
                return $this->shouldRetryForBody($body);
            }
        }

        return true;
    }

    protected function shouldRetryForBody(string $body): bool
    {
        return stripos($body, '<StatusCode>SystemErr</StatusCode>') !== false
            || stripos($body, 'SystemErr') !== false;
    }

    protected function logPayload(string $type, string $endpoint, string $action, string $payload, int $attempt, ?int $status = null): void
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

        $message = $masked;

        if (strlen($masked) > 2000) {
            $message = substr($masked, 0, 2000).'... [truncated]';
        }

        $this->logger->debug($message, $context);
    }

    protected function maskSecrets(string $payload): string
    {
        if ($payload === '') {
            return $payload;
        }

        $replacements = [
            '/<hot:UserName>(.*?)<\/hot:UserName>/i' => '<hot:UserName>***</hot:UserName>',
            '/<hot:Password>(.*?)<\/hot:Password>/i' => '<hot:Password>***</hot:Password>',
            '/<UserName>(.*?)<\/UserName>/i' => '<UserName>***</UserName>',
            '/<Password>(.*?)<\/Password>/i' => '<Password>***</Password>',
        ];

        $masked = preg_replace(array_keys($replacements), array_values($replacements), $payload);

        $username = Arr::get($this->config, 'username');
        $password = Arr::get($this->config, 'password');

        if ($username) {
            $masked = str_replace($username, '***', $masked);
        }

        if ($password) {
            $masked = str_replace($password, '***', $masked);
        }

        return $masked ?? $payload;
    }
}
