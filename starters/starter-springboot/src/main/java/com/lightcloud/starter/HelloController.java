package com.lightcloud.starter;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

	@GetMapping("/")
	public Map<String, String> index() {
		return Map.of("message", "Hello from Spring Boot on Light Cloud");
	}
}
