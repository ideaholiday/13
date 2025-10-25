<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ForumPost;
use Illuminate\Support\Facades\Auth;

class ForumController extends Controller
{
    /**
     * Display a listing of forum posts
     */
    public function index(Request $request)
    {
        $query = ForumPost::with(['user', 'replies.user'])
            ->orderBy('created_at', 'desc');
        
        // Filter by destination if provided
        if ($request->has('destination')) {
            $query->where('destination', $request->destination);
        }
        
        // Filter by category if provided
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        $posts = $query->paginate(20);
        
        return response()->json($posts);
    }

    /**
     * Store a newly created forum post
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'required|in:question,tip,review,discussion',
            'destination' => 'nullable|string|max:100',
        ]);

        $post = ForumPost::create([
            'user_id' => Auth::id() ?? 1, // fallback for dev
            ...$validated,
        ]);

        $post->load('user');

        return response()->json($post, 201);
    }

    /**
     * Display the specified forum post with replies
     */
    public function show($id)
    {
        $post = ForumPost::with(['user', 'replies.user'])
            ->findOrFail($id);
        
        return response()->json($post);
    }

    /**
     * Like a forum post
     */
    public function like($id)
    {
        $post = ForumPost::findOrFail($id);
        $post->increment('likes');
        
        return response()->json(['likes' => $post->likes]);
    }
}
