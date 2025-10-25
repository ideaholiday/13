<?php

namespace App\Console\Commands;

use App\Services\TBO\SoapClient12;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class TboPing extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tbo:ping';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a dummy SOAP ping to verify TBO connectivity.';

    /**
     * Execute the console command.
     */
    public function handle(SoapClient12 $client)
    {
        $endpoint = config('services.tbo.flight_auth_url');

        if (! $endpoint) {
            $this->error('TBO endpoint is not configured. Check your environment settings.');

            return self::FAILURE;
        }

        $action = 'Ping';
        $body = '<PingRequest xmlns="http://travelboutiqueonline.com/"><Request>Ping</Request></PingRequest>';

        try {
            $response = $client->request($action, $body, $endpoint);

            Log::channel(config('services.tbo.log_channel', 'tbo'))
                ->info('TBO ping response', ['response' => $response]);

            $this->info('TBO ping request sent successfully.');
            $this->line(json_encode($response, JSON_PRETTY_PRINT));

            return self::SUCCESS;
        } catch (Throwable $exception) {
            Log::channel(config('services.tbo.log_channel', 'tbo'))
                ->error('TBO ping failed', ['error' => $exception->getMessage()]);

            $this->error('TBO ping failed: '.$exception->getMessage());

            return self::FAILURE;
        }
    }
}
