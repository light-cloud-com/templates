<?php

declare(strict_types=1);

use App\Action\HealthAction;
use App\Action\HomeAction;
use Slim\App;

return function (App $app): void {
    $app->get('/', HomeAction::class);
    $app->get('/health', HealthAction::class);
};
