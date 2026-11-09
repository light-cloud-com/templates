<?php

declare(strict_types=1);

namespace App\Action;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

/** GET /health */
final class HealthAction
{
    private readonly float $startedAt;

    public function __construct(?float $startedAt = null)
    {
        $this->startedAt = $startedAt ?? microtime(true);
    }

    public function __invoke(Request $request, Response $response): Response
    {
        $response->getBody()->write(json_encode([
            'status' => 'healthy',
            'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
            'uptime' => microtime(true) - $this->startedAt,
        ], JSON_THROW_ON_ERROR));

        return $response->withHeader('Content-Type', 'application/json');
    }
}
