package com.lightcloud.greeting;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/hello")
public class GreetingResource {

    private final GreetingService greetingService;

    GreetingResource(GreetingService greetingService) {
        this.greetingService = greetingService;
    }

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        return greetingService.greeting();
    }
}
