package com.example.items.item;

public class ItemNotFoundException extends RuntimeException {
    public ItemNotFoundException() {
        super("Item not found");
    }
}
