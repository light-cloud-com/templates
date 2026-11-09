// Package config reads the app's settings from the environment.
package config

import "os"

// Config holds the settings the app needs to start.
type Config struct {
	Port    string // PORT, set by Light Cloud
	GinMode string // GIN_MODE: release (default), debug or test
}

// Load reads the settings, using defaults for anything unset.
func Load() Config {
	return Config{
		Port:    getenv("PORT", "8080"),
		GinMode: getenv("GIN_MODE", "release"),
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
