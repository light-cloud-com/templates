// Package server holds the HTTP routes, handlers and middleware.
package server

import (
	"net/http"
	"time"
)

// New returns the HTTP handler with every route and middleware registered.
func New() http.Handler {
	h := &handlers{started: time.Now()}

	mux := http.NewServeMux()
	mux.HandleFunc("/", h.index)
	mux.HandleFunc("/health", h.health)

	return logRequests(mux)
}
