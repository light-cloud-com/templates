<p align="center">
  <img src="./logo.png" alt="Light Cloud" width="200" />
</p>

<h1 align="center">Static HTML Boilerplate</h1>

<p align="center">
  A simple static HTML website, ready to deploy on Light Cloud.
</p>

<p align="center">
  <a href="https://console.light-cloud.com/new?repo=https://github.com/light-cloud-com/starter-html"><img src="https://light-cloud.com/button.svg" alt="Deploy to Light Cloud" /></a>
</p>

---

## Features

- Pure HTML, CSS, and JavaScript
- No build step required
- Lightweight and fast
- Ready for instant deployment

## Local Development

Simply open `index.html` in your browser, or use a local server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js (npx)
npx serve .
```

## Deploy to Light Cloud

### 1. Create an Account

Visit [console.light-cloud.com](https://console.light-cloud.com) and sign up with GitHub or Google.

### 2. Create New Application

1. Click **"New Application"** in the dashboard
2. Select **"Static Site"** as the deployment type
3. Choose **"Static HTML"** as the framework

### 3. Connect Repository

- **Option A:** Fork this repository and connect it via GitHub
- **Option B:** Push this code to your own GitHub repository and connect it

### 4. Configure Build Settings

Light Cloud will auto-detect your settings, but you can verify:

| Setting | Value |
|---------|-------|
| Build Command | *(leave empty)* |
| Output Directory | `.` |

### 5. Deploy

Click **"Deploy"** and your site will be live in seconds!

Your site will be available at `https://your-app.light-cloud.io`

## Learn More

- [MDN Web Docs](https://developer.mozilla.org)
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
