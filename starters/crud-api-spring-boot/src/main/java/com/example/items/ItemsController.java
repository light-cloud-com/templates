package com.example.items;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class ItemsController {
    private static final String COLUMNS = "id, name, description, created_at, updated_at";

    private final JdbcClient jdbc;

    public ItemsController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /** A validated request body. */
    record ItemInput(String name, String description) {
        // Read from a raw map so a number sent as "name" is rejected, not converted.
        static ItemInput from(Map<String, Object> body) {
            String name = body.get("name") instanceof String s ? s.strip() : "";
            Object description = body.get("description");
            if (name.isEmpty() || name.length() > 200) {
                throw badRequest("name is required and must be 1 to 200 characters");
            }
            if (description != null && !(description instanceof String)) {
                throw badRequest("description must be a string");
            }
            return new ItemInput(name, (String) description);
        }
    }

    static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found");
    }

    /** Ids that cannot exist (not a whole number, beyond the 32-bit SERIAL) are 404. */
    static int itemId(String id) {
        try {
            int n = Integer.parseInt(id);
            if (n >= 1) return n;
        } catch (NumberFormatException e) {
            // falls through to 404
        }
        throw notFound();
    }

    static long wholeNumber(String value, long min, long max) {
        try {
            long n = Long.parseLong(value);
            if (n >= min && n <= max) return n;
        } catch (NumberFormatException e) {
            // falls through to 400
        }
        throw badRequest("limit must be 1 to 100 and offset 0 or more");
    }

    @GetMapping("/")
    public Map<String, Object> index() {
        return Map.of(
                "name", "CRUD API (Spring Boot)",
                "routes", List.of(
                        "GET /health",
                        "GET /items?limit=20&offset=0",
                        "GET /items/{id}",
                        "POST /items",
                        "PUT /items/{id}",
                        "DELETE /items/{id}",
                        "GET /docs"));
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

    @GetMapping("/items")
    public List<Item> list(@RequestParam(defaultValue = "20") String limit,
                           @RequestParam(defaultValue = "0") String offset) {
        return jdbc.sql("SELECT " + COLUMNS + " FROM items ORDER BY id LIMIT ? OFFSET ?")
                .params(wholeNumber(limit, 1, 100), wholeNumber(offset, 0, 1L << 53))
                .query(Item.class)
                .list();
    }

    @GetMapping("/items/{id}")
    public Item get(@PathVariable String id) {
        return jdbc.sql("SELECT " + COLUMNS + " FROM items WHERE id = ?")
                .param(itemId(id))
                .query(Item.class)
                .optional()
                .orElseThrow(ItemsController::notFound);
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public Item create(@RequestBody Map<String, Object> body) {
        ItemInput item = ItemInput.from(body);
        return jdbc.sql("INSERT INTO items (name, description) VALUES (?, ?) RETURNING " + COLUMNS)
                .params(item.name(), item.description())
                .query(Item.class)
                .single();
    }

    @PutMapping("/items/{id}")
    public Item update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        int itemId = itemId(id);
        ItemInput item = ItemInput.from(body);
        return jdbc.sql("UPDATE items SET name = ?, description = ?, updated_at = now() WHERE id = ? RETURNING " + COLUMNS)
                .params(item.name(), item.description(), itemId)
                .query(Item.class)
                .optional()
                .orElseThrow(ItemsController::notFound);
    }

    @DeleteMapping("/items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        if (jdbc.sql("DELETE FROM items WHERE id = ?").param(itemId(id)).update() == 0) {
            throw notFound();
        }
    }
}
