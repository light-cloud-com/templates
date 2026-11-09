package com.lightcloud.starter.hello;

import jakarta.validation.constraints.Size;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

	private final HelloService helloService;

	public HelloController(HelloService helloService) {
		this.helloService = helloService;
	}

	@GetMapping("/")
	public MessageResponse index() {
		return helloService.welcome();
	}

	@GetMapping("/hello")
	public MessageResponse hello(@RequestParam(defaultValue = "World") @Size(min = 1, max = 50) String name) {
		return helloService.greet(name);
	}
}
