package com.example.items.item;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Body of POST and PUT /items. */
public record ItemRequest(
        @NotBlank(message = ItemRequest.NAME_RULE) @Size(max = 200, message = ItemRequest.NAME_RULE) String name,
        String description) {

    static final String NAME_RULE = "name is required and must be 1 to 200 characters";

    public ItemRequest {
        // Validation runs after this, so "  x  " counts as one character.
        name = name == null ? null : name.strip();
    }
}
