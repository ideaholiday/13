<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Destination;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $posts = [
            [
                'title' => '48 Hours in Dubai: Sky-High Adventures',
                'excerpt' => 'See how to pack luxury experiences, desert thrills, and skyline dining into two days in Dubai.',
                'body' => '<p>Dubai delivers high-octane energy day and night. Start with sunrise views from the Burj Khalifa, explore old Dubai&rsquo;s souks, then sail a sunset dhow cruise along the Marina.</p>',
                'status' => 'published',
                'is_featured' => true,
                'publish_at' => now()->subDays(3),
                'categories' => ['guides'],
                'tags' => ['luxury', 'family'],
                'destinations' => ['dubai'],
            ],
            [
                'title' => 'Maldives vs. Bali: Which Island Escape Fits You?',
                'excerpt' => 'Compare the Maldives and Bali to find your dream island getaway, whether you crave quiet lagoons or cultural adventures.',
                'body' => '<p>The Maldives promises uninterrupted relaxation in overwater villas, while Bali mixes wellness retreats with temple exploring and cafe hopping.</p>',
                'status' => 'published',
                'is_featured' => true,
                'publish_at' => now()->subWeek(),
                'categories' => ['travel-tips'],
                'tags' => ['luxury', 'food', 'beach'],
                'destinations' => ['maldives', 'bali'],
            ],
            [
                'title' => 'Bangkok Street Food Guide for First Timers',
                'excerpt' => 'Navigate Bangkok&rsquo;s legendary street eats with our curated list of markets, must-try dishes, and hygiene hacks.',
                'body' => '<p>Sample pad thai along Yaowarat Road, cool down with mango sticky rice, and learn how to spot the busiest stalls for the freshest flavors.</p>',
                'status' => 'published',
                'publish_at' => now()->subDays(10),
                'categories' => ['guides', 'news'],
                'tags' => ['food', 'budget'],
                'destinations' => ['bangkok'],
            ],
        ];

        foreach ($posts as $postData) {
            $slug = Str::slug($postData['title']);

            $post = Post::updateOrCreate(
                ['slug' => $slug],
                Arr::only($postData, [
                    'title',
                    'excerpt',
                    'body',
                    'status',
                    'is_featured',
                    'publish_at',
                ]) + ['slug' => $slug]
            );

            $categoryIds = Category::query()
                ->whereIn('slug', $postData['categories'] ?? [])
                ->pluck('id')
                ->all();

            $tagIds = Tag::query()
                ->whereIn('slug', $postData['tags'] ?? [])
                ->pluck('id')
                ->all();

            $destinationIds = Destination::query()
                ->whereIn('slug', $postData['destinations'] ?? [])
                ->pluck('id')
                ->all();

            $post->categories()->sync($categoryIds);
            $post->tags()->sync($tagIds);
            $post->destinations()->sync($destinationIds);

            $wordCount = str_word_count(strip_tags($post->body));
            $post->update([
                'reading_minutes' => max(1, (int) ceil($wordCount / 200)),
            ]);
        }
    }
}
