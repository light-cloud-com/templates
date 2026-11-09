<p align="center">
  <img src="./logo.png" alt="Light Cloud" width="200" />
</p>

<h1 align="center">Next.js Boilerplate</h1>

<p align="center">
  A Next.js app on the App Router, rendered on a server, ready to deploy on Light Cloud.
</p>

<p align="center">
  <a href="https://console.light-cloud.com/new?repo=https://github.com/light-cloud-com/starter-nextjs"><img src="https://light-cloud.com/button.svg" alt="Deploy to Light Cloud" /></a>
</p>

---

## Features

- Next.js 16 with the App Router, scaffolded with `create-next-app`
- React 19 with server components
- TypeScript out of the box
- Server-rendered — runs as a container, not a static export

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build and run for production
npm run build && npm start
```

## Deploy to Light Cloud

### 1. Create an Account

Visit [console.light-cloud.com](https://console.light-cloud.com) and sign up with GitHub or Google.

### 2. Create New Application

1. Click **"New Application"** in the dashboard
2. Select **"Container"** as the deployment type
3. Choose **"Next.js"** as the framework

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

Click **"Deploy"** and your app will be live in minutes!

Your app will be available at `https://your-app.light-cloud.io`

## Learn More

This starter is the output of `create-next-app`, with only the changes noted above.

- [Next.js documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
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
