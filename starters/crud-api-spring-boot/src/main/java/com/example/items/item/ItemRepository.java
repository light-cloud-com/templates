package com.example.items.item;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

/** SQL for the items table (created by src/main/resources/schema.sql). */
@Repository
public class ItemRepository {
    private static final String COLUMNS = "id, name, description, created_at, updated_at";

    private final JdbcClient jdbc;

    public ItemRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Item> findPage(long limit, long offset) {
        return jdbc.sql("SELECT " + COLUMNS + " FROM items ORDER BY id LIMIT ? OFFSET ?")
                .params(limit, offset)
                .query(Item.class)
                .list();
    }

    public Optional<Item> findById(int id) {
        return jdbc.sql("SELECT " + COLUMNS + " FROM items WHERE id = ?")
                .param(id)
                .query(Item.class)
                .optional();
    }

    public Item insert(String name, String description) {
        return jdbc.sql("INSERT INTO items (name, description) VALUES (?, ?) RETURNING " + COLUMNS)
                .params(name, description)
                .query(Item.class)
                .single();
    }

    public Optional<Item> update(int id, String name, String description) {
        return jdbc.sql("UPDATE items SET name = ?, description = ?, updated_at = now() WHERE id = ? RETURNING " + COLUMNS)
                .params(name, description, id)
                .query(Item.class)
                .optional();
    }

    public boolean delete(int id) {
        return jdbc.sql("DELETE FROM items WHERE id = ?").param(id).update() > 0;
    }
}
