<?php

declare(strict_types=1);

namespace Tests\Action;

final class HomeActionTest extends AppTestCase
{
    public function testRootDescribesTheApi(): void
    {
        $response = $this->get('/');

        self::assertSame(200, $response->getStatusCode());
        self::assertSame('application/json', $response->getHeaderLine('Content-Type'));
        self::assertSame('Welcome to your PHP API', $this->json($response)['message']);
        self::assertSame(['health' => '/health', 'root' => '/'], $this->json($response)['endpoints']);
    }

    public function testUnknownRouteIs404(): void
    {
        self::assertSame(404, $this->get('/nope')->getStatusCode());
    }
}
