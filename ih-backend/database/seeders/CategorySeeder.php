<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Travel Tips' => 'Practical advice to make every journey smoother.',
            'Guides' => 'In-depth itineraries and destination walk-throughs.',
            'Deals' => 'Limited-time offers and savings for travelers.',
            'News' => 'Industry updates and IdeaHoliday announcements.',
        ];

        foreach ($categories as $name => $description) {
            Category::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'description' => $description,
                ]
            );
        }
    }
}
