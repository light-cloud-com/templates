package server

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"crud-api-gin/internal/store"
)

type handlers struct {
	store Store
}

func (h *handlers) index(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"name": "CRUD API (Gin)",
		"routes": []string{
			"GET /health",
			"GET /items?limit=20&offset=0",
			"GET /items/:id",
			"POST /items",
			"PUT /items/:id",
			"DELETE /items/:id",
		},
	})
}

func (h *handlers) health(c *gin.Context) {
	// A database that stops answering should give a 503, not a hung health check.
	ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
	defer cancel()
	if err := h.store.Ping(ctx); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database unavailable"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h *handlers) listItems(c *gin.Context) {
	limit, okLimit := intQuery(c, "limit", 20, 1, 100)
	offset, okOffset := intQuery(c, "offset", 0, 0, 1<<53)
	if !okLimit || !okOffset {
		badRequest(c, "limit must be 1 to 100 and offset 0 or more")
		return
	}
	items, err := h.store.List(c.Request.Context(), limit, offset)
	if err != nil {
		fail(c, err)
		return
	}
	c.JSON(http.StatusOK, items)
}

func (h *handlers) getItem(c *gin.Context) {
	id, ok := itemID(c)
	if !ok {
		notFound(c)
		return
	}
	item, err := h.store.Get(c.Request.Context(), id)
	if err != nil {
		fail(c, err)
		return
	}
	c.JSON(http.StatusOK, item)
}

func (h *handlers) createItem(c *gin.Context) {
	name, description, msg := parseItem(c)
	if msg != "" {
		badRequest(c, msg)
		return
	}
	item, err := h.store.Create(c.Request.Context(), name, description)
	if err != nil {
		fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, item)
}

func (h *handlers) updateItem(c *gin.Context) {
	id, ok := itemID(c)
	if !ok {
		notFound(c)
		return
	}
	name, description, msg := parseItem(c)
	if msg != "" {
		badRequest(c, msg)
		return
	}
	item, err := h.store.Update(c.Request.Context(), id, name, description)
	if err != nil {
		fail(c, err)
		return
	}
	c.JSON(http.StatusOK, item)
}

func (h *handlers) deleteItem(c *gin.Context) {
	id, ok := itemID(c)
	if !ok {
		notFound(c)
		return
	}
	if err := h.store.Delete(c.Request.Context(), id); err != nil {
		fail(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func badRequest(c *gin.Context, msg string) {
	c.JSON(http.StatusBadRequest, gin.H{"error": msg})
}

func notFound(c *gin.Context) {
	c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
}

// fail answers a store error: a missing item is a 404, anything else a 500.
func fail(c *gin.Context, err error) {
	if errors.Is(err, store.ErrNotFound) {
		notFound(c)
		return
	}
	slog.Error("database error", "error", err)
	c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong"})
}
