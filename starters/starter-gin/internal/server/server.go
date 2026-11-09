// Package server holds the HTTP routes, handlers and middleware.
package server

import "github.com/gin-gonic/gin"

// New returns the router with every route and middleware registered.
func New() *gin.Engine {
	r := gin.New()
	r.Use(requestLogger(), gin.Recovery())

	r.GET("/", index)
	r.GET("/health", health)

	return r
}
