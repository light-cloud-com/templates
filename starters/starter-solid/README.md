<p align="center">
  <img src="./logo.png" alt="Light Cloud" width="200" />
</p>

<h1 align="center">SolidJS Boilerplate</h1>

<p align="center">
  A SolidJS application powered by Vite, ready to deploy on Light Cloud.
</p>

<p align="center">
  <a href="https://www.light-cloud.com/templates/starter-solid"><img src="https://light-cloud.com/button.svg" alt="Deploy to Light Cloud" /></a>
</p>

---

## Features

- SolidJS 1.9 with fine-grained reactivity and TypeScript
- Client-side routing with Solid Router (Home, About, 404), lazy-loaded pages
- Layout component, CSS Modules per component, global styles in one place
- ESLint (flat config with eslint-plugin-solid), `tsc` type checking, Vitest with Solid Testing Library
- `VITE_` environment variables, typed in `src/env.d.ts`, with an `.env.example`

## How it works

```mermaid
flowchart LR
    src["src/ (Solid + TSX)"] -->|npm run build| vite["Vite + vite-plugin-solid"]
    vite --> dist["dist/ (static files)"]
    dist -->|served by| lc["Light Cloud CDN"]
    lc -->|unknown paths fall back to index.html| router["Solid Router"]
```

## Project structure

```text
.
├── index.html              # HTML entry, loads src/index.tsx
├── src/
│   ├── index.tsx           # Renders the app into #root
│   ├── App.tsx             # Router and route table
│   ├── components/         # Layout, Counter (+ its test), CSS Modules
│   ├── pages/              # Home, About, NotFound
│   ├── styles/global.css   # Design tokens and base styles
│   ├── test/setup.ts       # Testing Library matchers
│   └── env.d.ts            # Types for import.meta.env
├── .env.example            # VITE_ variables
├── eslint.config.js
├── tsconfig.json
└── vite.config.ts          # Vite and Vitest config
```

## Local development

The lockfile is pnpm's (`pnpm-lock.yaml`); npm works too.

```bash
pnpm install      # install dependencies
pnpm dev          # start the dev server on http://localhost:3000
pnpm lint         # ESLint
pnpm typecheck    # TypeScript
pnpm test         # Vitest
pnpm build        # production build into dist/
pnpm serve        # serve the production build locally
```

## Environment variables

Copy `.env.example` to `.env.local`. Only variables that start with `VITE_` reach the browser, and they are baked in at build time, so never put secrets in them. On Light Cloud, set them in the app's environment variables and redeploy.

## Deploy to Light Cloud

### 1. Create an Account

Visit [console.light-cloud.com](https://console.light-cloud.com) and sign up with GitHub or Google.

### 2. Create New Application

1. Click **"New Application"** in the dashboard
2. Select **"Static Site"** as the deployment type
3. Choose **"SolidJS"** as the framework

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

This starter began as `npx degit solidjs/templates/ts` and adds routing, a layout, lint and tests.

- [SolidJS documentation](https://docs.solidjs.com)
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
