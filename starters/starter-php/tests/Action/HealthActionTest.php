<?php

declare(strict_types=1);

namespace Tests\Action;

use App\Action\HealthAction;
use Slim\Psr7\Factory\ResponseFactory;
use Slim\Psr7\Factory\ServerRequestFactory;

final class HealthActionTest extends AppTestCase
{
    public function testHealthIsHealthy(): void
    {
        $response = $this->get('/health');

        self::assertSame(200, $response->getStatusCode());
        self::assertSame('healthy', $this->json($response)['status']);
    }

    public function testUptimeCountsFromStart(): void
    {
        $action = new HealthAction(microtime(true) - 60);
        $response = $action(
            (new ServerRequestFactory())->createServerRequest('GET', '/health'),
            (new ResponseFactory())->createResponse(),
        );

        self::assertGreaterThanOrEqual(60, $this->json($response)['uptime']);
    }
}
