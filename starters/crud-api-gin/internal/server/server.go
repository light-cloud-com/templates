// Package server holds the HTTP routes, handlers and middleware.
package server

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"

	"crud-api-gin/internal/store"
)

// Store is what the handlers need from the database. store.Postgres implements it;
// tests use an in-memory fake.
type Store interface {
	Ping(ctx context.Context) error
	List(ctx context.Context, limit, offset int64) ([]store.Item, error)
	Get(ctx context.Context, id int64) (store.Item, error)
	Create(ctx context.Context, name string, description *string) (store.Item, error)
	Update(ctx context.Context, id int64, name string, description *string) (store.Item, error)
	Delete(ctx context.Context, id int64) error
}

// New returns the router with every route and middleware registered.
func New(s Store) *gin.Engine {
	h := &handlers{store: s}

	r := gin.New()
	r.Use(requestLogger(), recovery())

	r.GET("/", h.index)
	r.GET("/health", h.health)
	r.GET("/items", h.listItems)
	r.GET("/items/:id", h.getItem)
	r.POST("/items", h.createItem)
	r.PUT("/items/:id", h.updateItem)
	r.DELETE("/items/:id", h.deleteItem)
	r.NoRoute(func(c *gin.Context) { c.JSON(http.StatusNotFound, gin.H{"error": "Not found"}) })

	return r
}
