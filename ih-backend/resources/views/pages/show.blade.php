<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $page->title }} | IdeaHoliday</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tailwindcss/typography@0.5.10/dist/typography.min.css">
    <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #f9fafb; color: #111827; }
        header { background: #f97316; color: white; padding: 2rem 1rem; text-align: center; }
        main { max-width: 800px; margin: -3rem auto 2rem; background: white; border-radius: 1rem; box-shadow: 0 10px 25px -15px rgba(15, 23, 42, 0.4); padding: 3rem 2.5rem; }
        img.hero { width: 100%; border-radius: 0.75rem; margin-bottom: 2rem; }
        .prose { max-width: none; }
        footer { text-align: center; color: #6b7280; padding: 2rem 0 3rem; font-size: 0.875rem; }
        @media (max-width: 768px) {
            main { margin: -4rem 1rem 1rem; padding: 2rem 1.5rem; }
        }
    </style>
</head>
<body>
<header>
    <h1>{{ $page->title }}</h1>
</header>
<main>
    @if ($page->image)
        <img class="hero" src="{{ asset('storage/' . $page->image) }}" alt="{{ $page->title }}" loading="lazy">
    @endif

    <article class="prose prose-orange">
        {!! $page->content !!}
    </article>
</main>
<footer>
    &copy; {{ date('Y') }} IdeaHoliday. All rights reserved.
</footer>
</body>
</html>
