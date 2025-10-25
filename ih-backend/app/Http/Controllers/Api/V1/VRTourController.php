<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\VRTour;

class VRTourController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // Optional: List all VR tours (for debug)
    public function index()
    {
        return VRTour::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    // Admin: Create VR tour
    public function store(Request $request)
    {
        $data = $request->validate([
            'hotel_id' => 'required|integer',
            'scenes' => 'required|array',
        ]);
        $vrTour = VRTour::create($data);
        return response()->json($vrTour, 201);
    }

    /**
     * Display the specified resource.
     */
    // Show VR tour for a hotel
    public function show($hotelId)
    {
        $vrTour = VRTour::where('hotel_id', $hotelId)->first();
        if (!$vrTour) {
            return response()->json(['message' => 'VR tour not found'], 404);
        }
        return response()->json($vrTour);
    }

    /**
     * Update the specified resource in storage.
     */
    // Optional: Update VR tour (admin)
    public function update(Request $request, $id)
    {
        $vrTour = VRTour::findOrFail($id);
        $data = $request->validate([
            'scenes' => 'sometimes|array',
        ]);
        $vrTour->update($data);
        return response()->json($vrTour);
    }

    /**
     * Remove the specified resource from storage.
     */
    // Optional: Delete VR tour (admin)
    public function destroy($id)
    {
        $vrTour = VRTour::findOrFail($id);
        $vrTour->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
