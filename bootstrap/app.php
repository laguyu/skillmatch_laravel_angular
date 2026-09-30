<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $exception, Request $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return false;
            }

            $message = preg_replace(
                [
                    '/postgres(?:ql)?:\/\/[^\s]+/i',
                    '/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i',
                ],
                ['[redacted database URL]', '[redacted email]'],
                $exception->getMessage(),
            ) ?? '';

            error_log(json_encode([
                'event' => 'api_exception',
                'path' => $request->path(),
                'exception' => get_class($exception),
                'code' => $exception->getCode(),
                'message' => mb_substr($message, 0, 900),
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

            return false;
        });

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
