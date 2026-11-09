package com.example.items.system;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** GET / (route index) and GET /health (database check). */
@RestController
public class SystemController {
    record ApiIndex(String name, List<String> routes) {
    }

    private static final ApiIndex INDEX = new ApiIndex("CRUD API (Spring Boot)", List.of(
            "GET /health",
            "GET /items?limit=20&offset=0",
            "GET /items/{id}",
            "POST /items",
            "PUT /items/{id}",
            "DELETE /items/{id}",
            "GET /docs"));

    private final JdbcClient jdbc;

    public SystemController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/")
    public ApiIndex index() {
        return INDEX;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        try {
            jdbc.sql("SELECT 1").query(Integer.class).single();
            return ResponseEntity.ok(Map.of("status", "ok"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", "Database unavailable"));
        }
    }
}
