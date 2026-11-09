// Package config reads the app's settings from the environment.
package config

import (
	"net/url"
	"os"
	"strings"
)

// Config holds the settings the app needs to start.
type Config struct {
	Port        string // PORT, set by Light Cloud
	GinMode     string // GIN_MODE: release (default), debug or test
	DatabaseURL string // built from the DB_* variables
}

// Load reads the settings, using defaults for anything unset.
func Load() Config {
	return Config{
		Port:        getenv("PORT", "8080"),
		GinMode:     getenv("GIN_MODE", "release"),
		DatabaseURL: databaseURL(),
	}
}

// Light Cloud sets DB_HOST ("host" or "host:port"), DB_NAME, DB_USER and DB_PASSWORD.
// sslmode=require: TLS on, certificate not verified (the database's certificate is
// platform-internal). Set DB_SSLMODE=disable for a local database without TLS.
func databaseURL() string {
	host := getenv("DB_HOST", "localhost")
	if !strings.Contains(host, ":") {
		host += ":5432"
	}
	u := url.URL{
		Scheme:   "postgres",
		User:     url.UserPassword(getenv("DB_USER", "postgres"), os.Getenv("DB_PASSWORD")),
		Host:     host,
		Path:     "/" + getenv("DB_NAME", "postgres"),
		RawQuery: url.Values{"sslmode": {getenv("DB_SSLMODE", "require")}, "pool_max_conns": {"5"}}.Encode(),
	}
	return u.String()
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
