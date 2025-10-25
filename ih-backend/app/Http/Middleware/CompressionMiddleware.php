<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CompressionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only compress if the client supports it and the response is compressible
        if (!$this->shouldCompress($request, $response)) {
            return $response;
        }

        // Get the content to compress
        $content = $response->getContent();
        
        // Compress the content
        $compressed = $this->compressContent($content, $request);
        
        if ($compressed !== false) {
            // Update the response with compressed content
            $response->setContent($compressed);
            
            // Set appropriate headers
            $response->headers->set('Content-Encoding', $this->getEncodingType($request));
            $response->headers->set('Content-Length', strlen($compressed));
            
            // Add Vary header to indicate content negotiation
            $response->headers->set('Vary', 'Accept-Encoding');
        }

        return $response;
    }

    /**
     * Determine if the response should be compressed
     */
    private function shouldCompress(Request $request, Response $response): bool
    {
        // Don't compress if client doesn't support compression
        if (!$request->headers->has('Accept-Encoding')) {
            return false;
        }

        // Don't compress if already compressed
        if ($response->headers->has('Content-Encoding')) {
            return false;
        }

        // Only compress certain content types
        $contentType = $response->headers->get('Content-Type', '');
        $compressibleTypes = [
            'application/json',
            'application/javascript',
            'text/css',
            'text/html',
            'text/javascript',
            'text/plain',
            'text/xml',
            'application/xml',
            'application/xhtml+xml',
            'image/svg+xml',
        ];

        $shouldCompress = false;
        foreach ($compressibleTypes as $type) {
            if (str_starts_with($contentType, $type)) {
                $shouldCompress = true;
                break;
            }
        }

        if (!$shouldCompress) {
            return false;
        }

        // Don't compress very small responses (less than 1KB)
        if (strlen($response->getContent()) < 1024) {
            return false;
        }

        return true;
    }

    /**
     * Compress content based on client preferences
     */
    private function compressContent(string $content, Request $request): string|false
    {
        $acceptEncoding = $request->headers->get('Accept-Encoding', '');
        
        // Prefer Brotli if supported
        if (str_contains($acceptEncoding, 'br') && function_exists('brotli_compress')) {
            $compressed = brotli_compress($content, 6); // Level 6 is a good balance
            if ($compressed !== false) {
                return $compressed;
            }
        }
        
        // Fall back to Gzip if Brotli fails or isn't supported
        if (str_contains($acceptEncoding, 'gzip') && function_exists('gzencode')) {
            $compressed = gzencode($content, 6); // Level 6 is a good balance
            if ($compressed !== false) {
                return $compressed;
            }
        }
        
        // Fall back to deflate if gzip fails
        if (str_contains($acceptEncoding, 'deflate') && function_exists('gzdeflate')) {
            $compressed = gzdeflate($content, 6);
            if ($compressed !== false) {
                return $compressed;
            }
        }

        return false;
    }

    /**
     * Get the encoding type based on what was used for compression
     */
    private function getEncodingType(Request $request): string
    {
        $acceptEncoding = $request->headers->get('Accept-Encoding', '');
        
        if (str_contains($acceptEncoding, 'br') && function_exists('brotli_compress')) {
            return 'br';
        }
        
        if (str_contains($acceptEncoding, 'gzip') && function_exists('gzencode')) {
            return 'gzip';
        }
        
        if (str_contains($acceptEncoding, 'deflate') && function_exists('gzdeflate')) {
            return 'deflate';
        }

        return 'identity';
    }
}
