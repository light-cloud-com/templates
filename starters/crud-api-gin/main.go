// Command crud-api-gin serves a CRUD REST API for items stored in PostgreSQL.
package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"crud-api-gin/internal/config"
	"crud-api-gin/internal/server"
	"crud-api-gin/internal/store"
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
	gin.SetMode(cfg.GinMode)

	// If the database is unreachable the app does not start.
	db, err := store.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("could not reach the database: %w", err)
	}
	defer db.Close()

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           server.New(db),
		ReadHeaderTimeout: 10 * time.Second,
	}

	errCh := make(chan error, 1)
	go func() {
		slog.Info("listening", "port", cfg.Port)
		if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
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
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return srv.Shutdown(shutdownCtx)
}
