<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;

class ApiKeyMiddleware {
    public function handle(Request $request, Closure $next) {
        $apiKey = $request->header('X-Api-Key');
        if ($apiKey !== env('IH_API_KEY')) {
            return response()->json(['message' => 'Invalid API key'], 401);
        }
        return $next($request);
    }
}
