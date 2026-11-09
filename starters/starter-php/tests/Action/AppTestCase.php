<?php

declare(strict_types=1);

namespace Tests\Action;

use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ResponseInterface;
use Slim\App;
use Slim\Psr7\Factory\ServerRequestFactory;

/** Sends requests through the real app, without a web server. */
abstract class AppTestCase extends TestCase
{
    protected function get(string $path): ResponseInterface
    {
        /** @var App<null> $app */
        $app = require __DIR__ . '/../../config/bootstrap.php';

        return $app->handle((new ServerRequestFactory())->createServerRequest('GET', $path));
    }

    /** @return array<string, mixed> */
    protected function json(ResponseInterface $response): array
    {
        return json_decode((string) $response->getBody(), true, flags: JSON_THROW_ON_ERROR);
    }
}
