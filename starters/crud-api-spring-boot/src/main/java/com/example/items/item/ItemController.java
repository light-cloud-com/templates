package com.example.items.item;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/items")
public class ItemController {
    private static final String PAGE_RULE = "limit must be 1 to 100 and offset 0 or more";

    private final ItemService items;

    public ItemController(ItemService items) {
        this.items = items;
    }

    @GetMapping
    public List<Item> list(
            @RequestParam(defaultValue = "20") @Min(value = 1, message = PAGE_RULE) @Max(value = 100, message = PAGE_RULE) long limit,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = PAGE_RULE) long offset) {
        return items.list(limit, offset);
    }

    @GetMapping("/{id}")
    public Item get(@PathVariable String id) {
        return items.get(itemId(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Item create(@Valid @RequestBody ItemRequest request) {
        return items.create(request);
    }

    @PutMapping("/{id}")
    public Item update(@PathVariable String id, @Valid @RequestBody ItemRequest request) {
        return items.update(itemId(id), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        items.delete(itemId(id));
    }

    /** Ids that cannot exist (not a whole number, beyond the 32-bit SERIAL) are 404, not 400. */
    static int itemId(String id) {
        try {
            int n = Integer.parseInt(id);
            if (n >= 1) return n;
        } catch (NumberFormatException e) {
            // falls through to 404
        }
        throw new ItemNotFoundException();
    }
}
