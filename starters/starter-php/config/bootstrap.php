<?php

declare(strict_types=1);

use Slim\Factory\AppFactory;

// Builds the Slim app (settings, middleware, routes) and returns it.
// Used by public/index.php and by the tests.
$settings = require __DIR__ . '/settings.php';

$app = AppFactory::create();

$app->addRoutingMiddleware();
$app->addErrorMiddleware(
    $settings['displayErrorDetails'],
    $settings['logErrors'],
    $settings['logErrorDetails'],
);

(require __DIR__ . '/routes.php')($app);

return $app;
