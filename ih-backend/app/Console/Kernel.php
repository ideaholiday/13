<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array<int, class-string>
     */
    protected $commands = [
        Commands\NormalizePageStatus::class,
    ];

    protected function schedule(Schedule $schedule): void
    {
        // Sync TBO static data nightly at 3:15 AM
        $schedule->command('tbo:sync IN')
            ->dailyAt('03:15')
            ->withoutOverlapping()
            ->runInBackground();
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }

        // ...existing code...
}
