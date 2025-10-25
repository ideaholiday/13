<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FlightController extends Controller
{
    public function search(Request $req): JsonResponse
    {
        $data = $req->validate([
            'from'       => 'required|string|size:3',
            'to'         => 'required|string|size:3|different:from',
            'departDate' => 'required|date_format:Y-m-d|after_or_equal:today',
            'adt'        => 'nullable|integer|min:1|max:9',
            'chd'        => 'nullable|integer|min:0|max:8',
            'inf'        => 'nullable|integer|min:0|max:4',
            'cabin'      => 'nullable|string|in:Economy,Premium,Business,First',
        ]);

        $sessionId = 'FL-' . Str::uuid()->toString();

        // --- Mock flight results (replace with TBO later) ---
        $results = [
            [
                'id' => 1,
                'carrier' => 'AI',
                'flightNo' => 'AI-601',
                'from' => strtoupper($data['from']),
                'to'   => strtoupper($data['to']),
                'departTime' => "{$data['departDate']}T08:30:00+05:30",
                'arriveTime' => "{$data['departDate']}T10:35:00+05:30",
                'duration' => 125,
                'stops' => 0,
                'fare' => ['currency' => 'INR', 'base' => 4200, 'final' => 4800],
            ],
            [
                'id' => 2,
                'carrier' => '6E',
                'flightNo' => '6E-213',
                'from' => strtoupper($data['from']),
                'to'   => strtoupper($data['to']),
                'departTime' => "{$data['departDate']}T12:00:00+05:30",
                'arriveTime' => "{$data['departDate']}T14:05:00+05:30",
                'duration' => 125,
                'stops' => 0,
                'fare' => ['currency' => 'INR', 'base' => 3900, 'final' => 4500],
            ],
        ];

        return response()->json([
            'sessionId' => $sessionId,
            'results'   => $results,
        ]);
    }
}
