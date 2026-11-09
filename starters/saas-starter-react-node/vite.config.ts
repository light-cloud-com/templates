import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The React app lives in client/ and builds into dist/client, which the
// Express server serves in production. In development Vite proxies /api to it.
export default defineConfig({
  root: "client",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "client/src"), "@shared": path.resolve(import.meta.dirname, "shared") },
  },
  // Pages are split with React.lazy (see client/src/app.tsx), so each route downloads on first visit.
  build: { outDir: "../dist/client", emptyOutDir: true },
  server: {
    port: Number(process.env.VITE_PORT) || 5173,
    proxy: { "/api": `http://localhost:${process.env.PORT || 8080}` },
  },
});
