// Package server holds the HTTP routes, handlers and middleware.
package server

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

// New returns the Fiber app with every route and middleware registered.
func New() *fiber.App {
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
		ReadTimeout:           10 * time.Second,
	})
	app.Use(requestLogger, recover.New())

	app.Get("/", index)
	app.Get("/health", health)

	return app
}
