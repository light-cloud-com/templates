FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o main .

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/main .

ENV PORT=8080
EXPOSE 8080
USER nobody

CMD ["./main"]
