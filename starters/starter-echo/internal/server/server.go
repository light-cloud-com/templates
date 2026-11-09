// Package server holds the HTTP routes, handlers and middleware.
package server

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// New returns the Echo instance with every route and middleware registered.
func New() *echo.Echo {
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true
	e.Use(requestLogger(), middleware.Recover())

	e.GET("/", index)
	e.GET("/health", health)

	return e
}
