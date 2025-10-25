<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;

class CmsController extends Controller
{
    public function list(Request $request)
    {
        $query = Page::query();

        if ($request->filled('status')) {
            $status = strtolower($request->get('status'));
            $query->whereIn('status', [$status, ucfirst($status)]);
        }

        return $query
            ->select('title', 'slug', 'image', 'status', 'updated_at')
            ->latest()
            ->get();
    }

    public function show(string $slug)
    {
        return Page::where('slug', $slug)
            ->whereIn('status', ['published', 'Published'])
            ->firstOrFail();
    }

    public function debugPages()
    {
        return Page::select('id', 'title', 'slug', 'status', 'updated_at')
            ->orderBy('id')
            ->get();
    }
}
