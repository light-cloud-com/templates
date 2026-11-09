package com.lightcloud.greeting;

import jakarta.enterprise.context.ApplicationScoped;

import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class GreetingService {

    private final String message;

    GreetingService(@ConfigProperty(name = "greeting.message") String message) {
        this.message = message;
    }

    public String greeting() {
        return message;
    }
}
