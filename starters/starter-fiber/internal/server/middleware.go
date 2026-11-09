package server

import (
	"log/slog"
	"time"

	"github.com/gofiber/fiber/v2"
)

// requestLogger writes one structured log line per request.
func requestLogger(c *fiber.Ctx) error {
	start := time.Now()
	if err := c.Next(); err != nil {
		// Run the error handler now, so the log line has the real status (404, 500, ...).
		if herr := c.App().ErrorHandler(c, err); herr != nil {
			_ = c.SendStatus(fiber.StatusInternalServerError)
		}
	}
	slog.Info("request",
		"method", c.Method(),
		"path", c.Path(),
		"status", c.Response().StatusCode(),
		"duration", time.Since(start).String(),
	)
	return nil
}
