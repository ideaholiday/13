<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Destination;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class BlogController extends Controller
{
    public function posts(): JsonResponse
    {
        $limit = (int) request()->input('limit', 10);
        $limit = $limit > 0 ? min($limit, 50) : 10;

        $query = Post::query()
            ->publishScope()
            ->with(['categories:id,name,slug', 'tags:id,name,slug', 'destinations:id,name,slug,type,country_code'])
            ->latest('publish_at');

        if ($search = request()->input('q')) {
            $query->where(function (Builder $builder) use ($search) {
                if (DB::getDriverName() === 'mysql') {
                    $builder->whereRaw('MATCH(title, excerpt, body) AGAINST (? IN BOOLEAN MODE)', [$search]);
                } else {
                    $builder
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%")
                        ->orWhere('body', 'like', "%{$search}%");
                }
            });
        }

        if ($destination = request()->input('destination')) {
            $query->whereHas('destinations', fn (Builder $builder) => $builder->where('slug', $destination));
        }

        if ($category = request()->input('category')) {
            $query->whereHas('categories', fn (Builder $builder) => $builder->where('slug', $category));
        }

        if ($tag = request()->input('tag')) {
            $query->whereHas('tags', fn (Builder $builder) => $builder->where('slug', $tag));
        }

        if (request()->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $paginator = $query->paginate($limit)->withQueryString();

        return response()->json([
            'data' => $paginator->getCollection()->map(fn (Post $post) => $this->transformPostSummary($post)),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function facets(): JsonResponse
    {
        return response()->json([
            'categories' => Category::query()->orderBy('name')->get(['name', 'slug']),
            'tags' => Tag::query()->orderBy('name')->get(['name', 'slug']),
        ]);
    }

    public function post(string $slug): JsonResponse
    {
        $post = Post::query()
            ->publishScope()
            ->where('slug', $slug)
            ->with([
                'categories:id,name,slug',
                'tags:id,name,slug',
                'destinations:id,name,slug,type,country_code',
                'author:id,name',
            ])
            ->first();

        if (! $post) {
            return response()->json(['message' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        $related = Post::query()
            ->publishScope()
            ->where('id', '!=', $post->id)
            ->where(function (Builder $builder) use ($post) {
                $categoryIds = $post->categories->pluck('id');
                $destinationIds = $post->destinations->pluck('id');

                if ($categoryIds->isNotEmpty()) {
                    $builder->whereHas('categories', fn (Builder $relation) => $relation->whereIn('categories.id', $categoryIds));
                }

                if ($destinationIds->isNotEmpty()) {
                    $builder->orWhereHas('destinations', fn (Builder $relation) => $relation->whereIn('destinations.id', $destinationIds));
                }
            })
            ->with(['categories:id,name,slug', 'destinations:id,name,slug'])
            ->limit(5)
            ->get()
            ->map(fn (Post $relatedPost) => $this->transformPostSummary($relatedPost));

        return response()->json([
            'data' => $this->transformPostDetail($post),
            'related' => $related,
        ]);
    }

    public function sitemap(): Response
    {
        $baseUrl = rtrim(config('app.url', URL::to('/')), '/');

        $posts = Post::query()
            ->publishScope()
            ->orderByDesc('publish_at')
            ->get(['slug', 'updated_at', 'publish_at']);

        $destinations = Destination::query()
            ->whereHas('posts', fn (Builder $builder) => $builder->publishScope())
            ->get(['slug', 'updated_at']);

        $xml = view('feeds.blog-sitemap', [
            'baseUrl' => $baseUrl,
            'posts' => $posts,
            'destinations' => $destinations,
        ])->render();

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }

    private function transformPostSummary(Post $post): array
    {
        return [
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'cover_image' => $post->cover_image,
            'og_image' => $post->og_image,
            'is_featured' => (bool) $post->is_featured,
            'publish_at' => optional($post->publish_at ?? $post->created_at)->toIso8601String(),
            'reading_minutes' => $post->reading_minutes,
            'destinations' => $post->destinations->map(fn ($dest) => [
                'name' => $dest->name,
                'slug' => $dest->slug,
                'type' => $dest->type,
                'country_code' => $dest->country_code,
            ])->values(),
            'categories' => $post->categories->map(fn ($cat) => [
                'name' => $cat->name,
                'slug' => $cat->slug,
            ])->values(),
            'tags' => $post->tags->map(fn ($tag) => [
                'name' => $tag->name,
                'slug' => $tag->slug,
            ])->values(),
        ];
    }

    private function transformPostDetail(Post $post): array
    {
        return $this->transformPostSummary($post) + [
            'body' => $post->body,
            'seo_title' => $post->seo_title,
            'seo_description' => $post->seo_description,
            'og_image' => $post->og_image,
            'author' => $post->author?->only(['id', 'name']),
        ];
    }
}
