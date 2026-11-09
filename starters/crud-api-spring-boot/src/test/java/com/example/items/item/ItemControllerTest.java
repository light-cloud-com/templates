package com.example.items.item;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.items.config.JsonConfig;

/** Web layer only: no database, the service is a mock. */
@WebMvcTest(ItemController.class)
@Import(JsonConfig.class)
class ItemControllerTest {
    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-01-01T00:00:00Z");

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private ItemService items;

    @Test
    void listUsesDefaultPage() throws Exception {
        when(items.list(20, 0)).thenReturn(List.of(new Item(1, "First", null, NOW, NOW)));

        mvc.perform(get("/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("First"))
                .andExpect(jsonPath("$[0].created_at").exists());
    }

    @Test
    void listRejectsLimitAbove100() throws Exception {
        mvc.perform(get("/items").param("limit", "101"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("limit must be 1 to 100 and offset 0 or more"));
    }

    @Test
    void unknownOrInvalidIdIs404() throws Exception {
        when(items.get(7)).thenThrow(new ItemNotFoundException());

        mvc.perform(get("/items/7")).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Item not found"));
        mvc.perform(get("/items/abc")).andExpect(status().isNotFound());
    }

    @Test
    void createTrimsNameAndAnswers201() throws Exception {
        when(items.create(any())).thenReturn(new Item(1, "Box", "Hello", NOW, NOW));

        mvc.perform(post("/items").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"  Box  \", \"description\": \"Hello\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
        verify(items).create(new ItemRequest("Box", "Hello"));
    }

    @Test
    void createRejectsBlankName() throws Exception {
        mvc.perform(post("/items").contentType(MediaType.APPLICATION_JSON).content("{\"name\": \"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("name is required and must be 1 to 200 characters"));
    }

    @Test
    void createRejectsMalformedJsonAndNonStringName() throws Exception {
        for (String body : List.of("{", "[\"x\"]", "{\"name\": 123}", "{\"name\": \"x\", \"description\": 5}")) {
            mvc.perform(post("/items").contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").isString());
        }
    }
}
