package com.lightcloud.root;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.is;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

@QuarkusTest
class RootResourceTest {

    @Test
    void rootDescribesTheService() {
        given()
            .when().get("/")
            .then()
                .statusCode(200)
                .body("service", is("starter-quarkus"))
                .body("status", is("ok"))
                .body("endpoints", contains("/hello"));
    }
}
