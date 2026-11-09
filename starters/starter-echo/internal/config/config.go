// Package config reads the app's settings from the environment.
package config

import "os"

// Config holds the settings the app needs to start.
type Config struct {
	Port string // PORT, set by Light Cloud
}

// Load reads the settings, using defaults for anything unset.
func Load() Config {
	return Config{
		Port: getenv("PORT", "8080"),
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
