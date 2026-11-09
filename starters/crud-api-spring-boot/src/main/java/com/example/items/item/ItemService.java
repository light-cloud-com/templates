package com.example.items.item;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ItemService {
    private final ItemRepository repository;

    public ItemService(ItemRepository repository) {
        this.repository = repository;
    }

    public List<Item> list(long limit, long offset) {
        return repository.findPage(limit, offset);
    }

    public Item get(int id) {
        return repository.findById(id).orElseThrow(ItemNotFoundException::new);
    }

    public Item create(ItemRequest request) {
        return repository.insert(request.name(), request.description());
    }

    public Item update(int id, ItemRequest request) {
        return repository.update(id, request.name(), request.description()).orElseThrow(ItemNotFoundException::new);
    }

    public void delete(int id) {
        if (!repository.delete(id)) {
            throw new ItemNotFoundException();
        }
    }
}
