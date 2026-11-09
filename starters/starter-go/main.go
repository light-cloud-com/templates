package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

var startTime = time.Now()

type Response struct {
	Message   string            `json:"message,omitempty"`
	Version   string            `json:"version,omitempty"`
	Endpoints map[string]string `json:"endpoints,omitempty"`
	Status    string            `json:"status,omitempty"`
	Timestamp string            `json:"timestamp,omitempty"`
	Uptime    float64           `json:"uptime,omitempty"`
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/", rootHandler)
	http.HandleFunc("/health", healthHandler)

	log.Printf("Server running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	response := Response{
		Message: "Welcome to your Go API",
		Version: "1.0.0",
		Endpoints: map[string]string{
			"health": "/health",
			"root":   "/",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	response := Response{
		Status:    "healthy",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Uptime:    time.Since(startTime).Seconds(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
