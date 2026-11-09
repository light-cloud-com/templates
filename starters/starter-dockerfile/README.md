<p align="center">
  <img src="./logo.png" alt="Light Cloud" width="200" />
</p>

<h1 align="center">Dockerfile Boilerplate</h1>

<p align="center">
  A custom Dockerfile for any runtime, ready to deploy on Light Cloud.
</p>

<p align="center">
  <a href="https://console.light-cloud.com/new?repo=https://github.com/light-cloud-com/starter-dockerfile"><img src="https://light-cloud.com/button.svg" alt="Deploy to Light Cloud" /></a>
</p>

---

## Features

- Bring your own Dockerfile — any language, any runtime
- A small Node.js server included as a working example, ready to replace
- Listens on `$PORT`, which is what Cloud Run sends traffic to
- Docker-ready for Cloud Run

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |

## Local Development

```bash
# Build the image
docker build -t my-app .

# Run it
docker run -p 8080:8080 -e PORT=8080 my-app
```

Replace `server.js` and the `Dockerfile` with your own — the only requirement is
that the container listens on `$PORT`.

## Deploy to Light Cloud

### 1. Create an Account

Visit [console.light-cloud.com](https://console.light-cloud.com) and sign up with GitHub or Google.

### 2. Create New Application

1. Click **"New Application"** in the dashboard
2. Select **"Container"** as the deployment type
3. Choose **"Dockerfile"** as the runtime

### 3. Connect Repository

- **Option A:** Fork this repository and connect it via GitHub
- **Option B:** Push this code to your own GitHub repository and connect it

### 4. Configure Settings

Light Cloud will auto-detect your settings, but you can verify:

| Setting | Value |
|---------|-------|
| Port | `8080` |
| Dockerfile | Auto-detected |

### 5. Deploy

Click **"Deploy"** and your container will be live in minutes!

Your container will be available at `https://your-app.light-cloud.io`

## Learn More

- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Docker documentation](https://docs.docker.com)
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
