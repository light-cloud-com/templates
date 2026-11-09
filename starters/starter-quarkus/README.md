<p align="center">
  <img src="./logo.png" alt="Light Cloud" width="200" />
</p>

<h1 align="center">Quarkus API Boilerplate</h1>

<p align="center">
  A Quarkus REST service built with Maven, ready to deploy on Light Cloud.
</p>

<p align="center">
  <a href="https://www.light-cloud.com/templates/starter-quarkus"><img src="https://light-cloud.com/button.svg" alt="Deploy to Light Cloud" /></a>
</p>

---

## Features

- Quarkus REST (Jakarta REST) with Jackson, built with Maven (wrapper included, no local Maven needed)
- Resources per feature, with CDI services injected through the constructor
- Settings in `application.properties`, each one overridable by an environment variable
- `@QuarkusTest` tests with REST Assured
- Live coding in dev mode
- Packaged as an uber-jar: the default fast-jar layout writes loose dependencies a generic `COPY target/*.jar` cannot pick up in one piece

## How it works

```mermaid
flowchart LR
    client["Client"] -->|HTTP| root["RootResource<br/>GET /"]
    client -->|HTTP| greeting["GreetingResource<br/>GET /hello"]
    greeting --> service["GreetingService"]
    service --> config[("application.properties<br/>+ environment")]
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service name, status and endpoints (JSON) |
| GET | `/hello` | Plain-text greeting (`GREETING_MESSAGE`) |

## Project structure

```
.
├── pom.xml
├── mvnw, mvnw.cmd, .mvn/              Maven wrapper
└── src
    ├── main
    │   ├── docker/                    Quarkus' own Dockerfiles (not used by Light Cloud)
    │   ├── java/com/lightcloud
    │   │   ├── greeting/              GreetingResource, GreetingService
    │   │   └── root/RootResource.java
    │   └── resources/application.properties
    └── test/java/com/lightcloud
        ├── greeting/                  GreetingResourceTest, GreetingResourceIT
        └── root/RootResourceTest.java
```

## Configuration

| Variable | Default | Meaning |
|----------|---------|---------|
| `PORT` | `8080` | Port to listen on (Light Cloud sets it) |
| `GREETING_MESSAGE` | `Hello from Quarkus REST` | Text returned by `GET /hello` |

Copy `.env.example` to `.env`; Quarkus reads it in dev mode.

## Local Development

You need Java 17 or newer.

```bash
# Run in dev mode with live reload
./mvnw quarkus:dev

# Run the tests
./mvnw test

# Build an uber-jar (the platform runs this, without tests)
./mvnw clean package

# Run the jar
java -jar target/*-runner.jar
```

The API will be available at `http://localhost:8080`

## Deploy to Light Cloud

### 1. Create an Account

Visit [console.light-cloud.com](https://console.light-cloud.com) and sign up with GitHub or Google.

### 2. Create New Application

1. Click **"New Application"** in the dashboard
2. Select **"Container"** as the deployment type
3. Choose **"Quarkus"** as the framework

### 3. Connect Repository

- **Option A:** Fork this repository and connect it via GitHub
- **Option B:** Push this code to your own GitHub repository and connect it

### 4. Configure Settings

Light Cloud will auto-detect your settings, but you can verify:

| Setting | Value |
|---------|-------|
| Port | `8080` |
| Start Command | `java -jar target/*-runner.jar` |

### 5. Deploy

Click **"Deploy"** and your API will be live in minutes!

Your API will be available at `https://your-app.light-cloud.io`

## Learn More

This starter began as `Quarkus CLI` output and was split into feature packages.

- [Quarkus documentation](https://quarkus.io/guides/)
- [Quarkus CLI](https://quarkus.io/guides/cli-tooling)
- [Light Cloud documentation](https://docs.light-cloud.com)

---

<p align="center">
  <a href="https://light-cloud.com">Website</a> •
  <a href="https://docs.light-cloud.com">Documentation</a> •
  <a href="https://console.light-cloud.com">Console</a>
</p>

<p align="center">
  Made with ☁️ by <a href="https://light-cloud.com">Light Cloud</a>
</p>
