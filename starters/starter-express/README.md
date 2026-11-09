<p align="center">
  <img src="./logo.png" alt="Light Cloud" width="200" />
</p>

<h1 align="center">Express API Boilerplate</h1>

<p align="center">
  An Express REST API with CORS and a health check, ready to deploy on Light Cloud.
</p>

<p align="center">
  <a href="https://console.light-cloud.com/new?repo=https://github.com/light-cloud-com/starter-express"><img src="https://light-cloud.com/button.svg" alt="Deploy to Light Cloud" /></a>
</p>

---

## Features

- Express 4
- CORS enabled and JSON body parsing
- Unmatched routes answer in JSON rather than Express's HTML error page, so a client parsing responses gets the same shape from every route
- Listens on `$PORT`, defaulting to 8080

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message and API info |
| GET | `/health` | Health check with uptime |

## Local Development

```bash
# Install dependencies
npm install

# Start the server
npm start

# Start with file watching
npm run dev
```

The API will be available at `http://localhost:8080`

## Deploy to Light Cloud

### 1. Create an Account

Visit [console.light-cloud.com](https://console.light-cloud.com) and sign up with GitHub or Google.

### 2. Create New Application

1. Click **"New Application"** in the dashboard
2. Select **"Container"** as the deployment type
3. Choose **"Express"** as the framework

### 3. Connect Repository

- **Option A:** Fork this repository and connect it via GitHub
- **Option B:** Push this code to your own GitHub repository and connect it

### 4. Configure Settings

Light Cloud will auto-detect your settings, but you can verify:

| Setting | Value |
|---------|-------|
| Port | `8080` |
| Start Command | `npm start` |

### 5. Deploy

Click **"Deploy"** and your API will be live in minutes!

Your API will be available at `https://your-app.light-cloud.io`

## Learn More

- [Express documentation](https://expressjs.com)
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
