<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ForumReply;
use App\Models\ForumPost;
use Illuminate\Support\Facades\Auth;

class ForumReplyController extends Controller
{
    /**
     * Store a newly created reply
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'post_id' => 'required|exists:forum_posts,id',
            'content' => 'required|string',
        ]);

        $reply = ForumReply::create([
            'user_id' => Auth::id() ?? 1, // fallback for dev
            ...$validated,
        ]);

        // Increment replies count on the post
        ForumPost::where('id', $validated['post_id'])->increment('replies_count');

        $reply->load('user');

        return response()->json($reply, 201);
    }

    /**
     * Like a reply
     */
    public function like($id)
    {
        $reply = ForumReply::findOrFail($id);
        $reply->increment('likes');
        
        return response()->json(['likes' => $reply->likes]);
    }
}
