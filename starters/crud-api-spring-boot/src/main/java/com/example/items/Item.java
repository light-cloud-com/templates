package com.example.items;

import java.time.OffsetDateTime;

public record Item(int id, String name, String description, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
}
