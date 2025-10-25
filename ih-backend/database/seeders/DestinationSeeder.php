<?php

namespace Database\Seeders;

use App\Models\Destination;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class DestinationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $destinations = [
            [
                'name' => 'Dubai',
                'type' => 'city',
                'country_code' => 'AE',
                'lat' => 25.204849,
                'lng' => 55.270782,
                'summary' => '<p>The city of superlatives with luxury shopping, desert safaris, and skyline views.</p>',
            ],
            [
                'name' => 'Bangkok',
                'type' => 'city',
                'country_code' => 'TH',
                'lat' => 13.756331,
                'lng' => 100.501762,
                'summary' => '<p>Thailand’s vibrant capital brimming with street food, temples, and nightlife.</p>',
            ],
            [
                'name' => 'Goa',
                'type' => 'region',
                'country_code' => 'IN',
                'summary' => '<p>India’s sunshine state boasting beaches, Portuguese heritage, and laid-back vibes.</p>',
            ],
            [
                'name' => 'Maldives',
                'type' => 'country',
                'country_code' => 'MV',
                'summary' => '<p>Overwater villas, coral reefs, and barefoot luxury across 26 atolls.</p>',
            ],
            [
                'name' => 'Paris',
                'type' => 'city',
                'country_code' => 'FR',
                'summary' => '<p>The City of Lights—timeless romance, art, and iconic landmarks.</p>',
            ],
            [
                'name' => 'Bali',
                'type' => 'region',
                'country_code' => 'ID',
                'summary' => '<p>Ceremonial culture, terraced rice fields, and beach clubs on Indonesia’s famed island.</p>',
            ],
        ];

        foreach ($destinations as $destination) {
            Destination::updateOrCreate(
                ['slug' => Str::slug($destination['name'])],
                Arr::only($destination, [
                    'name',
                    'type',
                    'country_code',
                    'state',
                    'lat',
                    'lng',
                    'summary',
                ]) + ['slug' => Str::slug($destination['name'])]
            );
        }
    }
}
