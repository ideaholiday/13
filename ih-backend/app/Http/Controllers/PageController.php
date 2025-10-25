<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\View\View;

class PageController extends Controller
{
    private const RESERVED_SLUGS = [
        'admin',
        'login',
        'register',
        'up',
    ];

    public function show(string $slug): View
    {
        if (in_array($slug, self::RESERVED_SLUGS, true)) {
            abort(404);
        }

        $page = Page::published()->where('slug', $slug)->firstOrFail();

        return view('pages.show', [
            'page' => $page,
        ]);
    }
}
