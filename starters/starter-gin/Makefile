# Loads .env when present, so `make run` picks up local settings.
-include .env
export

.PHONY: run test build

run:
	go run .

test:
	go vet ./...
	go test ./...

build:
	CGO_ENABLED=0 go build -trimpath -o bin/server .
