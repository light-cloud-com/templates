<?php

declare(strict_types=1);

// APP_DEBUG=true shows error details in responses; leave it off in production.
$debug = filter_var(getenv('APP_DEBUG') ?: 'false', FILTER_VALIDATE_BOOL);

return [
    'displayErrorDetails' => $debug,
    'logErrors' => true,
    'logErrorDetails' => true,
];
