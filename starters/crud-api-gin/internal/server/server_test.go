package server

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"crud-api-gin/internal/store"
)

// fakeStore keeps items in memory, so handler tests need no database.
type fakeStore struct {
	items   map[int64]store.Item
	nextID  int64
	pingErr error
	listErr error
	limit   int64 // last List arguments
	offset  int64
}

func newFakeStore() *fakeStore {
	f := &fakeStore{items: map[int64]store.Item{}, nextID: 1}
	_, _ = f.Create(context.Background(), "First item", nil)
	return f
}

func (f *fakeStore) Ping(context.Context) error { return f.pingErr }

func (f *fakeStore) List(_ context.Context, limit, offset int64) ([]store.Item, error) {
	f.limit, f.offset = limit, offset
	if f.listErr != nil {
		return nil, f.listErr
	}
	items := []store.Item{}
	for id := int64(1); id < f.nextID; id++ {
		if item, ok := f.items[id]; ok {
			items = append(items, item)
		}
	}
	return items, nil
}

func (f *fakeStore) Get(_ context.Context, id int64) (store.Item, error) {
	item, ok := f.items[id]
	if !ok {
		return store.Item{}, store.ErrNotFound
	}
	return item, nil
}

func (f *fakeStore) Create(_ context.Context, name string, description *string) (store.Item, error) {
	now := time.Now()
	item := store.Item{ID: int32(f.nextID), Name: name, Description: description, CreatedAt: now, UpdatedAt: now}
	f.items[f.nextID] = item
	f.nextID++
	return item, nil
}

func (f *fakeStore) Update(_ context.Context, id int64, name string, description *string) (store.Item, error) {
	item, ok := f.items[id]
	if !ok {
		return store.Item{}, store.ErrNotFound
	}
	item.Name, item.Description, item.UpdatedAt = name, description, time.Now()
	f.items[id] = item
	return item, nil
}

func (f *fakeStore) Delete(_ context.Context, id int64) error {
	if _, ok := f.items[id]; !ok {
		return store.ErrNotFound
	}
	delete(f.items, id)
	return nil
}

func TestRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	long := strings.Repeat("a", 201)

	tests := []struct {
		name       string
		method     string
		path       string
		body       string
		setup      func(*fakeStore)
		wantStatus int
		wantBody   string // substring of the response body
	}{
		{name: "index lists routes", method: "GET", path: "/", wantStatus: 200, wantBody: `"CRUD API (Gin)"`},
		{name: "health ok", method: "GET", path: "/health", wantStatus: 200, wantBody: `{"status":"ok"}`},
		{name: "health without database", method: "GET", path: "/health", setup: func(f *fakeStore) { f.pingErr = errors.New("down") }, wantStatus: 503, wantBody: `"Database unavailable"`},

		{name: "list", method: "GET", path: "/items", wantStatus: 200, wantBody: `"name":"First item"`},
		{name: "list empty is an array", method: "GET", path: "/items", setup: func(f *fakeStore) { f.items = map[int64]store.Item{} }, wantStatus: 200, wantBody: `[]`},
		{name: "list limit 100", method: "GET", path: "/items?limit=100", wantStatus: 200},
		{name: "list limit 0", method: "GET", path: "/items?limit=0", wantStatus: 400, wantBody: `"limit must be 1 to 100 and offset 0 or more"`},
		{name: "list limit 101", method: "GET", path: "/items?limit=101", wantStatus: 400},
		{name: "list limit not a number", method: "GET", path: "/items?limit=ten", wantStatus: 400},
		{name: "list negative offset", method: "GET", path: "/items?offset=-1", wantStatus: 400},
		{name: "list database error", method: "GET", path: "/items", setup: func(f *fakeStore) { f.listErr = errors.New("boom") }, wantStatus: 500, wantBody: `"Something went wrong"`},

		{name: "get", method: "GET", path: "/items/1", wantStatus: 200, wantBody: `"id":1`},
		{name: "get missing", method: "GET", path: "/items/2", wantStatus: 404, wantBody: `"Item not found"`},
		{name: "get id not a number", method: "GET", path: "/items/abc", wantStatus: 404},
		{name: "get id zero", method: "GET", path: "/items/0", wantStatus: 404},
		{name: "get id above 32 bits", method: "GET", path: "/items/4294967296", wantStatus: 404},

		{name: "create", method: "POST", path: "/items", body: `{"name":"  New  ","description":"Hello"}`, wantStatus: 201, wantBody: `"name":"New","description":"Hello"`},
		{name: "create without description", method: "POST", path: "/items", body: `{"name":"New"}`, wantStatus: 201, wantBody: `"description":null`},
		{name: "create name 200 chars", method: "POST", path: "/items", body: `{"name":"` + long[:200] + `"}`, wantStatus: 201},
		{name: "create name 201 chars", method: "POST", path: "/items", body: `{"name":"` + long + `"}`, wantStatus: 400},
		{name: "create name blank", method: "POST", path: "/items", body: `{"name":"   "}`, wantStatus: 400, wantBody: `"name is required and must be 1 to 200 characters"`},
		{name: "create name not a string", method: "POST", path: "/items", body: `{"name":5}`, wantStatus: 400},
		{name: "create description not a string", method: "POST", path: "/items", body: `{"name":"New","description":5}`, wantStatus: 400, wantBody: `"description must be a string"`},
		{name: "create not JSON", method: "POST", path: "/items", body: `name=New`, wantStatus: 400, wantBody: `"Send a JSON object"`},

		{name: "update", method: "PUT", path: "/items/1", body: `{"name":"Renamed"}`, wantStatus: 200, wantBody: `"name":"Renamed","description":null`},
		{name: "update missing", method: "PUT", path: "/items/2", body: `{"name":"Renamed"}`, wantStatus: 404},
		{name: "update invalid", method: "PUT", path: "/items/1", body: `{}`, wantStatus: 400},

		{name: "delete", method: "DELETE", path: "/items/1", wantStatus: 204},
		{name: "delete missing", method: "DELETE", path: "/items/2", wantStatus: 404},

		{name: "unknown route", method: "GET", path: "/missing", wantStatus: 404, wantBody: `{"error":"Not found"}`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fake := newFakeStore()
			if tt.setup != nil {
				tt.setup(fake)
			}
			req := httptest.NewRequest(tt.method, tt.path, strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()

			New(fake).ServeHTTP(rec, req)

			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d (body %s)", rec.Code, tt.wantStatus, rec.Body.String())
			}
			if !strings.Contains(rec.Body.String(), tt.wantBody) {
				t.Errorf("body = %s, want it to contain %s", rec.Body.String(), tt.wantBody)
			}
		})
	}
}

func TestListPagination(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		query      string
		wantLimit  int64
		wantOffset int64
	}{
		{"", 20, 0},
		{"?limit=5", 5, 0},
		{"?limit=100&offset=40", 100, 40},
		{"?offset=3", 20, 3},
	}

	for _, tt := range tests {
		t.Run("query "+tt.query, func(t *testing.T) {
			fake := newFakeStore()
			rec := httptest.NewRecorder()
			New(fake).ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/items"+tt.query, nil))

			if rec.Code != http.StatusOK {
				t.Fatalf("status = %d, want 200", rec.Code)
			}
			if fake.limit != tt.wantLimit || fake.offset != tt.wantOffset {
				t.Errorf("List(limit=%d, offset=%d), want (%d, %d)", fake.limit, fake.offset, tt.wantLimit, tt.wantOffset)
			}
		})
	}
}
