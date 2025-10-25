<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            DestinationSeeder::class,
            CategorySeeder::class,
            TagSeeder::class,
            PageSeeder::class,
            PostSeeder::class,
        ]);

        User::updateOrCreate(
            ['email' => 'admin@ideaholiday.in'],
            [
                'name' => 'IdeaHoliday Admin',
                'password' => Hash::make('Admin@123'),
                'is_admin' => true,
            ]
        );
    }
}
