<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\EcoRating;

class EcoRatingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // Optional: List all eco ratings (for debug)
    public function index()
    {
        return EcoRating::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    // Admin: Create eco rating
    public function store(Request $request)
    {
        $data = $request->validate([
            'ratable_type' => 'required|string',
            'ratable_id' => 'required|integer',
            'score' => 'required|integer|min:1|max:5',
            'certifications' => 'nullable|array',
            'features' => 'nullable|array',
        ]);
        $data['ratable_type'] = strtolower($data['ratable_type']);
        $ecoRating = EcoRating::create($data);
        return response()->json($ecoRating, 201);
    }

    /**
     * Display the specified resource.
     */
    // Show eco rating for a hotel or flight
    public function show($type, $id)
    {
        $ecoRating = EcoRating::where('ratable_type', strtolower($type))
            ->where('ratable_id', $id)
            ->first();
        if (!$ecoRating) {
            return response()->json(['message' => 'Eco rating not found'], 404);
        }
        return response()->json($ecoRating);
    }

    /**
     * Update the specified resource in storage.
     */
    // Optional: Update eco rating (admin)
    public function update(Request $request, $id)
    {
        $ecoRating = EcoRating::findOrFail($id);
        $data = $request->validate([
            'score' => 'sometimes|integer|min:1|max:5',
            'certifications' => 'nullable|array',
            'features' => 'nullable|array',
        ]);
        $ecoRating->update($data);
        return response()->json($ecoRating);
    }

    /**
     * Remove the specified resource from storage.
     */
    // Optional: Delete eco rating (admin)
    public function destroy($id)
    {
        $ecoRating = EcoRating::findOrFail($id);
        $ecoRating->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
