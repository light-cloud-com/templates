<?php

declare(strict_types=1);

// Front controller: every request that is not a real file under public/ lands here.
require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../config/bootstrap.php';
$app->run();
