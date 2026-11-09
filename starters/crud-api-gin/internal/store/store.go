// Package store keeps items in PostgreSQL.
package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ErrNotFound is returned when no item has the requested id.
var ErrNotFound = errors.New("item not found")

// Item is one row of the items table.
type Item struct {
	ID          int32     `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

const columns = "id, name, description, created_at, updated_at"

// The app creates its table on start, so there is no migration step.
const schema = `CREATE TABLE IF NOT EXISTS items (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	description TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`

// Postgres stores items in a PostgreSQL database.
type Postgres struct {
	pool *pgxpool.Pool
}

// New connects to the database and creates the items table if it is missing.
// It fails when the database cannot be reached.
func New(ctx context.Context, databaseURL string) (*Postgres, error) {
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, err
	}
	if _, err := pool.Exec(ctx, schema); err != nil {
		pool.Close()
		return nil, err
	}
	return &Postgres{pool: pool}, nil
}

// Close closes every connection in the pool.
func (p *Postgres) Close() { p.pool.Close() }

// Ping checks that the database answers.
func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

// List returns items oldest first.
func (p *Postgres) List(ctx context.Context, limit, offset int64) ([]Item, error) {
	rows, _ := p.pool.Query(ctx, "SELECT "+columns+" FROM items ORDER BY id LIMIT $1 OFFSET $2", limit, offset)
	return pgx.CollectRows(rows, pgx.RowToStructByPos[Item])
}

// Get returns one item, or ErrNotFound.
func (p *Postgres) Get(ctx context.Context, id int64) (Item, error) {
	rows, _ := p.pool.Query(ctx, "SELECT "+columns+" FROM items WHERE id = $1", id)
	return one(rows)
}

// Create inserts an item and returns it.
func (p *Postgres) Create(ctx context.Context, name string, description *string) (Item, error) {
	rows, _ := p.pool.Query(ctx, "INSERT INTO items (name, description) VALUES ($1, $2) RETURNING "+columns, name, description)
	return one(rows)
}

// Update replaces an item's name and description, or returns ErrNotFound.
func (p *Postgres) Update(ctx context.Context, id int64, name string, description *string) (Item, error) {
	rows, _ := p.pool.Query(ctx, `UPDATE items SET name = $1, description = $2, updated_at = now()
		WHERE id = $3 RETURNING `+columns, name, description, id)
	return one(rows)
}

// Delete removes an item, or returns ErrNotFound.
func (p *Postgres) Delete(ctx context.Context, id int64) error {
	tag, err := p.pool.Exec(ctx, "DELETE FROM items WHERE id = $1", id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// one reads exactly one item; query errors surface here too (pgx defers them to rows).
func one(rows pgx.Rows) (Item, error) {
	item, err := pgx.CollectExactlyOneRow(rows, pgx.RowToStructByPos[Item])
	if errors.Is(err, pgx.ErrNoRows) {
		return Item{}, ErrNotFound
	}
	return item, err
}
