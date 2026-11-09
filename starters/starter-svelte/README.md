<p align="center">
  <img src="./logo.png" alt="Light Cloud" width="200" />
</p>

<h1 align="center">Svelte Boilerplate</h1>

<p align="center">
  A Svelte application powered by Vite, ready to deploy on Light Cloud.
</p>

<p align="center">
  <a href="https://console.light-cloud.com/new?repo=https://github.com/light-cloud-com/starter-svelte"><img src="https://light-cloud.com/button.svg" alt="Deploy to Light Cloud" /></a>
</p>

---

## Features

- Svelte 5 with runes, built with Vite
- Components in `src/lib/components`, each with its own scoped styles
- Global design tokens and base styles in `src/styles/global.css`, with dark mode
- ESLint (flat config with eslint-plugin-svelte) and Vitest with Testing Library
- `VITE_` environment variables, with an `.env.example`

A single page with no router. When you need several pages, routing and server code, start from the SvelteKit template instead.

## How it works

```mermaid
flowchart LR
    src["src/ (Svelte components)"] -->|npm run build| vite["Vite + vite-plugin-svelte"]
    vite --> dist["dist/ (static files)"]
    dist -->|served by| lc["Light Cloud CDN"]
```

## Project structure

```text
.
├── index.html                  # HTML entry, loads src/main.js
├── public/                     # favicon, icon sprite; copied as is into dist/
├── src/
│   ├── main.js                 # Mounts App into #app
│   ├── App.svelte              # Page composition
│   ├── assets/                 # Images imported by components
│   ├── lib/components/         # Layout, Hero, Counter (+ test), NextSteps, Ticks
│   ├── styles/global.css       # Design tokens and base styles
│   └── test/setup.js           # Testing Library matchers
├── .env.example                # VITE_ variables
├── eslint.config.js
├── svelte.config.js
└── vite.config.js              # Vite and Vitest config
```

## Local development

```bash
npm install       # install dependencies
npm run dev       # start the dev server on http://localhost:5173
npm run lint      # ESLint
npm test          # Vitest
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Environment variables

Copy `.env.example` to `.env.local`. Only variables that start with `VITE_` reach the browser, and they are baked in at build time, so never put secrets in them. On Light Cloud, set them in the app's environment variables and redeploy.

## Deploy to Light Cloud

### 1. Create an Account

Visit [console.light-cloud.com](https://console.light-cloud.com) and sign up with GitHub or Google.

### 2. Create New Application

1. Click **"New Application"** in the dashboard
2. Select **"Static Site"** as the deployment type
3. Choose **"Svelte"** as the framework

### 3. Connect Repository

- **Option A:** Fork this repository and connect it via GitHub
- **Option B:** Push this code to your own GitHub repository and connect it

### 4. Configure Build Settings

Light Cloud will auto-detect your settings, but you can verify:

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Output Directory | `dist` |

### 5. Deploy

Click **"Deploy"** and your app will be live in seconds!

Your app will be available at `https://your-app.light-cloud.io`

## Learn More

This starter is the output of `npm create vite@latest -- --template svelte`, with only the changes noted above.

- [Svelte documentation](https://svelte.dev)
- [Vite documentation](https://vite.dev)
- [Light Cloud documentation](https://docs.light-cloud.com)

## License

[MIT](./LICENSE)

---

<p align="center">
  <a href="https://light-cloud.com">Website</a> •
  <a href="https://docs.light-cloud.com">Documentation</a> •
  <a href="https://console.light-cloud.com">Console</a>
</p>

<p align="center">
  Made with ☁️ by <a href="https://light-cloud.com">Light Cloud</a>
</p>
