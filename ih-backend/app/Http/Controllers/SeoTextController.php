<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Response;

class SeoTextController extends Controller
{
    public function robots()
    {
        $site = rtrim(config('app.url', 'http://127.0.0.1:8000'), '/');
        $txt = "User-agent: *\nDisallow:\n\nSitemap: {$site}/api/v1/blog/sitemap\n";

        return Response::make($txt, 200, ['Content-Type' => 'text/plain']);
    }

    public function humans()
    {
        $txt = "/* TEAM */\n"
            . "Developer: Idea Holiday Pvt Ltd\n"
            . "Website: https://ideaholiday.in\n"
            . "Contact: customersupport@ideaholidays.com\n\n"
            . "/* SITE */\n"
            . 'Last update: ' . now()->toDateString() . "\n"
            . "Backend: Laravel 12 + Filament\n"
            . "Frontend: Next.js 14 + Tailwind\n"
            . "Hosting: DigitalOcean\n";

        return Response::make($txt, 200, ['Content-Type' => 'text/plain']);
    }
}
