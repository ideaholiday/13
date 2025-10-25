<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeadStoreRequest;
use App\Mail\LeadSubmitted;
use App\Models\Destination;
use App\Models\Lead;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class LeadController extends Controller
{
    public function store(LeadStoreRequest $request): JsonResponse
    {
        $rateKey = 'leads:' . $request->ip();

        if (RateLimiter::tooManyAttempts($rateKey, 5)) {
            $seconds = RateLimiter::availableIn($rateKey);

            return response()->json([
                'message' => 'Too many enquiries. Please try again in ' . $seconds . ' seconds.',
            ], Response::HTTP_TOO_MANY_REQUESTS);
        }

        RateLimiter::hit($rateKey, 600);

        $post = $request->filled('postSlug')
            ? Post::publishScope()->where('slug', $request->input('postSlug'))->first()
            : null;

        $destination = $request->filled('destinationSlug')
            ? Destination::where('slug', $request->input('destinationSlug'))->first()
            : null;

        $lead = Lead::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'message' => $request->input('message'),
            'source' => $request->input('source', 'blog'),
            'post_id' => $post?->id,
            'destination_id' => $destination?->id,
            'utm_source' => $request->input('utm_source'),
            'utm_medium' => $request->input('utm_medium'),
            'utm_campaign' => $request->input('utm_campaign'),
        ]);

        $lead->loadMissing(['post:id,title,slug', 'destination:id,name,slug']);

        $recipient = config('services.leads.to')
            ?? config('mail.from.address')
            ?? 'leads@ideaholiday.in';

        Mail::to($recipient)->send(new LeadSubmitted($lead));

        return response()->json([
            'ok' => true,
            'lead_id' => $lead->id,
        ]);
    }
}
