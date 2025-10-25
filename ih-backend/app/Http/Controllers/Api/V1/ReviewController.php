<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\Review;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $type = $request->query('type');
        $id = $request->query('id');
        $reviews = Review::with('user')
            ->where('bookable_type', $type)
            ->where('bookable_id', $id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        return response()->json($reviews);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'bookable_type' => 'required|string',
            'bookable_id' => 'required|integer',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'required|string|max:200',
            'content' => 'required|string|max:2000',
            'photos' => 'nullable|array',
            'photos.*' => 'url',
        ]);

        $review = Review::create([
            'user_id' => Auth::id() ?? 1, // fallback for dev
            ...$validated,
        ]);

        return response()->json($review, 201);
    }

    public function markHelpful(Request $request, $id)
    {
        $review = Review::findOrFail($id);
        $review->increment('helpful_count');
        return response()->json(['helpful_count' => $review->helpful_count]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
