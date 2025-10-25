<?php

namespace App\Exceptions;

use Exception;
use Throwable;

class TboException extends Exception
{
    protected array $payload;

    public function __construct(string $message, ?string $code = null, array $payload = [], ?Throwable $previous = null)
    {
        parent::__construct($message, is_numeric($code) ? (int) $code : 0, $previous);

        $this->payload = $payload;
    }

    public function context(): array
    {
        return $this->payload;
    }
}
