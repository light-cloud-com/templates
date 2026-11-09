package server

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRoutes(t *testing.T) {
	handler := New()

	tests := []struct {
		name            string
		path            string
		wantStatus      int
		wantMessage     string
		wantStatusField string
	}{
		{name: "index", path: "/", wantStatus: http.StatusOK, wantMessage: "Welcome to your Go API"},
		{name: "health", path: "/health", wantStatus: http.StatusOK, wantStatusField: "healthy"},
		{name: "unknown route", path: "/missing", wantStatus: http.StatusNotFound},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := httptest.NewRecorder()
			handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, tt.path, nil))

			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d", rec.Code, tt.wantStatus)
			}
			if tt.wantStatus != http.StatusOK {
				return
			}
			var got Response
			if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
				t.Fatalf("body is not JSON: %v", err)
			}
			if got.Message != tt.wantMessage || got.Status != tt.wantStatusField {
				t.Errorf("got message %q status %q, want %q and %q", got.Message, got.Status, tt.wantMessage, tt.wantStatusField)
			}
		})
	}
}
