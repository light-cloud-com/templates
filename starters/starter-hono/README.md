<p align="center">
  <img src="./logo.png" alt="Light Cloud" width="200" />
</p>

<h1 align="center">Hono API Boilerplate</h1>

<p align="center">
  A Hono REST API on the Node server adapter, ready to deploy on Light Cloud.
</p>

<p align="center">
  <a href="https://www.light-cloud.com/templates/starter-hono"><img src="https://light-cloud.com/button.svg" alt="Deploy to Light Cloud" /></a>
</p>

---

## Features

- Hono 4 on `@hono/node-server`
- REST API with health check endpoint
- ES modules
- Routes grouped in sub-apps, app built separately from the server so tests call it with `app.request()`
- Unmatched routes and errors answer in JSON
- Graceful shutdown on `SIGTERM`
- Tests with the built-in Node test runner, no extra dependencies
- Listens on `$PORT`, defaulting to 3000

## How it works

```mermaid
flowchart LR
    client["Client"] -->|HTTP| server["src/server.js<br/>@hono/node-server on PORT"]
    server --> app["src/app.js<br/>JSON 404 and errors"]
    app --> routes["src/routes/root.js<br/>/ and /health"]
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message and API info |
| GET | `/health` | Health check with uptime |

## Project structure

```text
.
├── src/
│   ├── app.js              # Hono app: mounts routes, JSON 404 and error handler
│   ├── server.js           # Starts the Node server, shuts down on SIGTERM
│   ├── config.js           # Settings read from the environment
│   └── routes/
│       └── root.js         # GET / and GET /health
├── test/
│   └── app.test.js         # node:test tests using app.request()
├── .env.example            # Environment variables the app reads
└── package.json
```

## Local Development

You need Node.js 22 or newer.

```bash
# Install dependencies
npm install

# Start the server
npm start

# Start with file watching
npm run dev

# Run the tests
npm test
```

The API will be available at `http://localhost:3000`. `.env.example` lists the environment variables the app reads.

## Deploy to Light Cloud

### 1. Create an Account

Visit [console.light-cloud.com](https://console.light-cloud.com) and sign up with GitHub or Google.

### 2. Create New Application

1. Click **"New Application"** in the dashboard
2. Select **"Container"** as the deployment type
3. Choose **"Hono"** as the framework

### 3. Connect Repository

- **Option A:** Fork this repository and connect it via GitHub
- **Option B:** Push this code to your own GitHub repository and connect it

### 4. Configure Settings

Light Cloud will auto-detect your settings, but you can verify:

| Setting | Value |
|---------|-------|
| Port | `3000` |
| Start Command | `npm start` |

### 5. Deploy

Click **"Deploy"** and your API will be live in minutes!

Your API will be available at `https://your-app.light-cloud.io`

## Learn More

- [Hono documentation](https://hono.dev/docs/)
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
