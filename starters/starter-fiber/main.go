// Command starter-fiber serves a small JSON API with Fiber.
package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"starter-fiber/internal/config"
	"starter-fiber/internal/server"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
	if err := run(); err != nil {
		slog.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

func run() error {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cfg := config.Load()
	app := server.New()

	errCh := make(chan error, 1)
	go func() {
		slog.Info("listening", "port", cfg.Port)
		// Listen returns nil once the app is shut down.
		if err := app.Listen(":" + cfg.Port); err != nil {
			errCh <- err
		}
	}()

	select {
	case err := <-errCh:
		return err
	case <-ctx.Done():
	}

	// Cloud Run sends SIGTERM and waits 10 seconds before it stops the container.
	slog.Info("shutting down")
	return app.ShutdownWithTimeout(10 * time.Second)
}
