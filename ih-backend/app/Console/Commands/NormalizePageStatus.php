<?php

namespace App\Console\Commands;

use App\Models\Page;
use Illuminate\Console\Command;

class NormalizePageStatus extends Command
{
    protected $signature = 'pages:normalize-status';

    protected $description = 'Lowercase all Page.status values';

    public function handle(): int
    {
        $count = 0;

        Page::query()->chunkById(200, function ($pages) use (&$count) {
            foreach ($pages as $page) {
                $normalized = strtolower($page->status ?? '');
                if ($page->status !== $normalized) {
                    $page->status = $normalized;
                    $page->save();
                }
                $count++;
            }
        });

        $this->info("Normalized {$count} pages.");

        return self::SUCCESS;
    }
}
