package com.lightcloud.starter.hello;

import org.springframework.stereotype.Service;

@Service
public class HelloService {

	public MessageResponse welcome() {
		return new MessageResponse("Hello from Spring Boot on Light Cloud");
	}

	public MessageResponse greet(String name) {
		return new MessageResponse("Hello, " + name.strip() + "!");
	}
}
