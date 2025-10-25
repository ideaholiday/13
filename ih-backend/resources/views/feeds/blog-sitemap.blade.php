<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>{{ $baseUrl }}/blog</loc>
        <priority>0.8</priority>
    </url>
    @foreach($posts as $post)
        <url>
            <loc>{{ $baseUrl }}/blog/{{ $post->slug }}</loc>
            @if($post->publish_at)
                <lastmod>{{ optional($post->publish_at)->toAtomString() }}</lastmod>
            @elseif($post->updated_at)
                <lastmod>{{ optional($post->updated_at)->toAtomString() }}</lastmod>
            @endif
            <priority>0.7</priority>
        </url>
    @endforeach
    @foreach($destinations as $destination)
        <url>
            <loc>{{ $baseUrl }}/destinations/{{ $destination->slug }}</loc>
            @if($destination->updated_at)
                <lastmod>{{ optional($destination->updated_at)->toAtomString() }}</lastmod>
            @endif
            <priority>0.6</priority>
        </url>
    @endforeach
</urlset>
