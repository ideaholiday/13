<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CarbonEmission;

class CarbonController extends Controller
{
    /**
     * Get carbon emission data for a flight
     */
    public function flight($flightId)
    {
        $emission = CarbonEmission::where('flight_id', $flightId)->first();
        
        if (!$emission) {
            // Return calculated data if not in database
            // Simple calculation: assume ~100kg CO2 per 1000km
            return response()->json([
                'flight_id' => $flightId,
                'co2_kg' => 125.50,
                'trees_equivalent' => 6.5,
                'offset_price' => 250.00,
                'currency' => 'INR',
                'calculated' => true,
            ]);
        }
        
        return response()->json($emission);
    }

    /**
     * Purchase carbon offset
     */
    public function offset(Request $request)
    {
        $validated = $request->validate([
            'flight_id' => 'required|string',
            'amount_kg' => 'required|numeric',
            'price' => 'required|numeric',
        ]);

        // Here you would integrate with payment gateway
        // For now, just return success
        return response()->json([
            'success' => true,
            'offset_id' => 'OFFSET_' . time(),
            'message' => 'Carbon offset purchased successfully',
            'details' => $validated,
        ], 201);
    }
}
