package com.example.items.item;

import java.time.OffsetDateTime;

/** An item as stored and returned (snake_case on the wire). */
public record Item(int id, String name, String description, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
}
