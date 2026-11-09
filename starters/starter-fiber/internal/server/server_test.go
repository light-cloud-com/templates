package server

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRoutes(t *testing.T) {
	app := New()

	tests := []struct {
		name       string
		path       string
		wantStatus int
		wantBody   string
	}{
		{"index", "/", http.StatusOK, `{"message":"Hello from Fiber on Light Cloud"}`},
		{"health", "/health", http.StatusOK, `{"status":"ok"}`},
		{"unknown route", "/missing", http.StatusNotFound, ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := app.Test(httptest.NewRequest(http.MethodGet, tt.path, nil))
			if err != nil {
				t.Fatal(err)
			}
			defer resp.Body.Close()
			body, _ := io.ReadAll(resp.Body)

			if resp.StatusCode != tt.wantStatus {
				t.Fatalf("status = %d, want %d", resp.StatusCode, tt.wantStatus)
			}
			if tt.wantBody != "" && string(body) != tt.wantBody {
				t.Errorf("body = %s, want %s", body, tt.wantBody)
			}
		})
	}
}
