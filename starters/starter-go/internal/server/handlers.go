package server

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"time"
)

// Response is the JSON body every route answers with.
type Response struct {
	Message   string            `json:"message,omitempty"`
	Version   string            `json:"version,omitempty"`
	Endpoints map[string]string `json:"endpoints,omitempty"`
	Status    string            `json:"status,omitempty"`
	Timestamp string            `json:"timestamp,omitempty"`
	Uptime    float64           `json:"uptime,omitempty"`
}

type handlers struct {
	started time.Time
}

func (h *handlers) index(w http.ResponseWriter, r *http.Request) {
	// "/" matches every path the mux has no other route for.
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	writeJSON(w, Response{
		Message: "Welcome to your Go API",
		Version: "1.0.0",
		Endpoints: map[string]string{
			"health": "/health",
			"root":   "/",
		},
	})
}

func (h *handlers) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, Response{
		Status:    "healthy",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Uptime:    time.Since(h.started).Seconds(),
	})
}

func writeJSON(w http.ResponseWriter, body any) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(body); err != nil {
		slog.Error("write response", "error", err)
	}
}
