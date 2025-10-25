<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class DestinationController extends Controller
{
    public function index(): JsonResponse
    {
        $query = Destination::query()->withCount(['posts' => fn (Builder $builder) => $builder->publishScope()]);

        if ($type = request()->input('type')) {
            $query->where('type', $type);
        }

        if ($search = request()->input('q')) {
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('country_code', 'like', "%{$search}%");
            });
        }

        $destinations = $query->orderBy('name')->get();

        return response()->json([
            'data' => $destinations->map(fn (Destination $destination) => $this->transformDestination($destination)),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $destination = Destination::query()
            ->where('slug', $slug)
            ->first();

        if (! $destination) {
            return response()->json(['message' => 'Destination not found'], Response::HTTP_NOT_FOUND);
        }

        $featuredPosts = $destination->posts()
            ->publishScope()
            ->where('is_featured', true)
            ->with(['categories:id,name,slug', 'destinations:id,name,slug', 'tags:id,name,slug'])
            ->limit(5)
            ->get();

        $recentPosts = $destination->posts()
            ->publishScope()
            ->latest('publish_at')
            ->with(['categories:id,name,slug', 'destinations:id,name,slug'])
            ->limit(5)
            ->get();

        return response()->json([
            'data' => $this->transformDestination($destination),
            'featuredPosts' => $featuredPosts->map(fn (Post $post) => $this->transformPostSummary($post)),
            'recentPosts' => $recentPosts->map(fn (Post $post) => $this->transformPostSummary($post)),
        ]);
    }

    private function transformDestination(Destination $destination): array
    {
        return [
            'name' => $destination->name,
            'slug' => $destination->slug,
            'type' => $destination->type,
            'country_code' => $destination->country_code,
            'state' => $destination->state,
            'lat' => $destination->lat,
            'lng' => $destination->lng,
            'summary' => $destination->summary,
            'hero_image' => $destination->hero_image,
            'seo_title' => $destination->seo_title,
            'seo_description' => $destination->seo_description,
            'og_image' => $destination->og_image,
            'posts_count' => $destination->posts_count ?? $destination->posts()->publishScope()->count(),
        ];
    }

    private function transformPostSummary(Post $post): array
    {
        return [
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'cover_image' => $post->cover_image,
            'publish_at' => optional($post->publish_at ?? $post->created_at)->toIso8601String(),
            'reading_minutes' => $post->reading_minutes,
            'destinations' => $post->destinations->map(fn ($dest) => [
                'name' => $dest->name,
                'slug' => $dest->slug,
            ])->values(),
            'categories' => $post->categories->map(fn ($cat) => [
                'name' => $cat->name,
                'slug' => $cat->slug,
            ])->values(),
        ];
    }
}
