package com.lightcloud.greeting;

import io.quarkus.test.junit.QuarkusIntegrationTest;

@QuarkusIntegrationTest
class GreetingResourceIT extends GreetingResourceTest {
    // Runs the same tests against the packaged jar (./mvnw verify -DskipITs=false).
}
