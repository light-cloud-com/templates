package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Item struct {
	ID          int32     `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

const columns = "id, name, description, created_at, updated_at"

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// Light Cloud sets DB_HOST ("host" or "host:port"), DB_NAME, DB_USER and DB_PASSWORD.
// sslmode=require: TLS on, certificate not verified (the database's certificate is
// platform-internal). Set DB_SSLMODE=disable for a local database without TLS.
func databaseURL() string {
	host := env("DB_HOST", "localhost")
	if !strings.Contains(host, ":") {
		host += ":5432"
	}
	u := url.URL{
		Scheme:   "postgres",
		User:     url.UserPassword(env("DB_USER", "postgres"), os.Getenv("DB_PASSWORD")),
		Host:     host,
		Path:     "/" + env("DB_NAME", "postgres"),
		RawQuery: url.Values{"sslmode": {env("DB_SSLMODE", "require")}, "pool_max_conns": {"5"}}.Encode(),
	}
	return u.String()
}

// parseItem reads {"name", "description"} from the body, or returns an error message.
func parseItem(c *gin.Context) (string, *string, string) {
	var body struct {
		Name        any `json:"name"`
		Description any `json:"description"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		return "", nil, "Send a JSON object"
	}
	name, _ := body.Name.(string)
	name = strings.TrimSpace(name)
	if n := len([]rune(name)); n < 1 || n > 200 {
		return "", nil, "name is required and must be 1 to 200 characters"
	}
	if body.Description == nil {
		return name, nil, ""
	}
	description, ok := body.Description.(string)
	if !ok {
		return "", nil, "description must be a string"
	}
	return name, &description, ""
}

// intQuery reads a whole number in [min, max], the fallback when absent, or ok=false.
func intQuery(c *gin.Context, key string, fallback, min, max int64) (int64, bool) {
	raw, present := c.GetQuery(key)
	if !present {
		return fallback, true
	}
	n, err := strconv.ParseInt(raw, 10, 64)
	return n, err == nil && n >= min && n <= max
}

// itemID is false for ids that cannot exist (the id column is a 32-bit SERIAL).
func itemID(c *gin.Context) (int64, bool) {
	n, err := strconv.ParseInt(c.Param("id"), 10, 32)
	return n, err == nil && n >= 1
}

func main() {
	ctx := context.Background()
	db, err := pgxpool.New(ctx, databaseURL())
	if err == nil {
		// Creates the table on start. If the database is unreachable the app does not start.
		_, err = db.Exec(ctx, `CREATE TABLE IF NOT EXISTS items (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			description TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)`)
	}
	if err != nil {
		log.Fatalf("Could not reach the database: %v", err)
	}

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Logger(), gin.CustomRecovery(func(c *gin.Context, err any) {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong"})
	}))

	notFound := func(c *gin.Context) { c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"}) }
	// fail answers a query error: no row is a 404, anything else a 500.
	fail := func(c *gin.Context, err error) {
		if errors.Is(err, pgx.ErrNoRows) {
			notFound(c)
			return
		}
		log.Printf("database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong"})
	}

	r.GET("/", func(c *gin.Context) {
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
	})

	r.GET("/health", func(c *gin.Context) {
		if err := db.Ping(c); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database unavailable"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.GET("/items", func(c *gin.Context) {
		limit, okLimit := intQuery(c, "limit", 20, 1, 100)
		offset, okOffset := intQuery(c, "offset", 0, 0, 1<<53)
		if !okLimit || !okOffset {
			c.JSON(http.StatusBadRequest, gin.H{"error": "limit must be 1 to 100 and offset 0 or more"})
			return
		}
		rows, _ := db.Query(c, "SELECT "+columns+" FROM items ORDER BY id LIMIT $1 OFFSET $2", limit, offset)
		items, err := pgx.CollectRows(rows, pgx.RowToStructByPos[Item])
		if err != nil {
			fail(c, err)
			return
		}
		c.JSON(http.StatusOK, items)
	})

	r.GET("/items/:id", func(c *gin.Context) {
		id, ok := itemID(c)
		if !ok {
			notFound(c)
			return
		}
		rows, _ := db.Query(c, "SELECT "+columns+" FROM items WHERE id = $1", id)
		item, err := pgx.CollectExactlyOneRow(rows, pgx.RowToStructByPos[Item])
		if err != nil {
			fail(c, err)
			return
		}
		c.JSON(http.StatusOK, item)
	})

	r.POST("/items", func(c *gin.Context) {
		name, description, msg := parseItem(c)
		if msg != "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": msg})
			return
		}
		rows, _ := db.Query(c, "INSERT INTO items (name, description) VALUES ($1, $2) RETURNING "+columns, name, description)
		item, err := pgx.CollectExactlyOneRow(rows, pgx.RowToStructByPos[Item])
		if err != nil {
			fail(c, err)
			return
		}
		c.JSON(http.StatusCreated, item)
	})

	r.PUT("/items/:id", func(c *gin.Context) {
		id, ok := itemID(c)
		if !ok {
			notFound(c)
			return
		}
		name, description, msg := parseItem(c)
		if msg != "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": msg})
			return
		}
		rows, _ := db.Query(c, `UPDATE items SET name = $1, description = $2, updated_at = now()
			WHERE id = $3 RETURNING `+columns, name, description, id)
		item, err := pgx.CollectExactlyOneRow(rows, pgx.RowToStructByPos[Item])
		if err != nil {
			fail(c, err)
			return
		}
		c.JSON(http.StatusOK, item)
	})

	r.DELETE("/items/:id", func(c *gin.Context) {
		id, ok := itemID(c)
		if !ok {
			notFound(c)
			return
		}
		tag, err := db.Exec(c, "DELETE FROM items WHERE id = $1", id)
		if err != nil {
			fail(c, err)
			return
		}
		if tag.RowsAffected() == 0 {
			notFound(c)
			return
		}
		c.Status(http.StatusNoContent)
	})

	r.NoRoute(func(c *gin.Context) { c.JSON(http.StatusNotFound, gin.H{"error": "Not found"}) })

	port := env("PORT", "8080")
	log.Printf("Listening on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
