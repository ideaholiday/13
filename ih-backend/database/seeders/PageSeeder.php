<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pages = [
            'About Us' => 'Learn more about IdeaHoliday and our mission to deliver memorable travel experiences.',
            'Contact Us' => 'Reach out to our support team for personalised travel assistance.',
            'FAQ' => 'Find quick answers to the most common questions from our travellers.',
            'Privacy Policy' => 'Understand how IdeaHoliday collects, uses, and protects your personal data.',
            'Terms & Conditions' => 'Review the legal terms that govern the use of IdeaHoliday services.',
            'Blog' => 'Stay tuned—fresh travel stories and tips are coming soon.',
        ];

        foreach ($pages as $title => $content) {
            $slug = Str::slug($title);

            Page::updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'content' => $content,
                    'status' => $title === 'Blog' ? 'draft' : 'published',
                ]
            );
        }
    }
}
