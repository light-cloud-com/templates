package com.lightcloud.starter.hello;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(HelloController.class)
@Import(HelloService.class)
class HelloControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void indexReturnsWelcomeMessage() throws Exception {
		mockMvc.perform(get("/"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value("Hello from Spring Boot on Light Cloud"));
	}

	@Test
	void helloGreetsByName() throws Exception {
		mockMvc.perform(get("/hello").param("name", "Ada"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value("Hello, Ada!"));
	}

	@Test
	void helloRejectsTooLongNameAsProblemDetail() throws Exception {
		mockMvc.perform(get("/hello").param("name", "x".repeat(51)))
				.andExpect(status().isBadRequest())
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
				.andExpect(jsonPath("$.status").value(400));
	}
}
