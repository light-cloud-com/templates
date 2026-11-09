package com.lightcloud.root;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/")
public class RootResource {

    @JsonPropertyOrder({"service", "status", "endpoints"})
    public record ServiceInfo(String service, String status, List<String> endpoints) {
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public ServiceInfo root() {
        return new ServiceInfo("starter-quarkus", "ok", List.of("/hello"));
    }
}
