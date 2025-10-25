<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\Post;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Response as ResponseFacade;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $site = rtrim(config('app.url', 'http://127.0.0.1:8000'), '/');

        $urls = [];
        $urls[] = $this->urlEntry("{$site}/blog", 'daily');

        Post::publishScope()
            ->orderByDesc('publish_at')
            ->get(['slug', 'publish_at', 'updated_at'])
            ->each(function (Post $post) use (&$urls, $site) {
                $lastmod = optional($post->publish_at ?? $post->updated_at ?? now())->toAtomString();
                $urls[] = $this->urlEntry("{$site}/blog/{$post->slug}", 'weekly', $lastmod);
            });

        $urls[] = $this->urlEntry("{$site}/destinations", 'weekly');

        Destination::query()
            ->orderByDesc('updated_at')
            ->get(['slug', 'updated_at'])
            ->each(function (Destination $destination) use (&$urls, $site) {
                $lastmod = optional($destination->updated_at ?? now())->toAtomString();
                $urls[] = $this->urlEntry("{$site}/destinations/{$destination->slug}", 'weekly', $lastmod);
            });

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        $xml .= implode('', $urls);
        $xml .= '</urlset>';

        return ResponseFacade::make($xml, 200, ['Content-Type' => 'application/xml']);
    }

    private function urlEntry(string $loc, string $changefreq, ?string $lastmod = null): string
    {
        $entry = '<url>';
        $entry .= '<loc>' . htmlspecialchars($loc, ENT_XML1) . '</loc>';
        if ($lastmod) {
            $entry .= '<lastmod>' . htmlspecialchars($lastmod, ENT_XML1) . '</lastmod>';
        }
        $entry .= '<changefreq>' . htmlspecialchars($changefreq, ENT_XML1) . '</changefreq>';
        $entry .= '</url>';

        return $entry;
    }
}
