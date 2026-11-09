import fs from "node:fs";
import path from "node:path";
import express, { type ErrorRequestHandler, type RequestHandler } from "express";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { ZodError } from "zod";
import { auth } from "./lib/auth.ts";
import { HttpError } from "./lib/errors.ts";
import { metaRoutes } from "./routes/meta.ts";
import { projectRoutes } from "./routes/projects.ts";
import { workspaceRoutes } from "./routes/workspace.ts";
import { adminRoutes } from "./routes/admin.ts";
import { v1Routes } from "./routes/v1.ts";

const clientDir = path.resolve(process.cwd(), "dist/client");

// Cookie-authenticated writes must come from this site. Better Auth checks its
// own routes; this covers ours. API-key requests carry no cookies.
const sameOrigin: RequestHandler = (req, _res, next) => {
  const origin = req.get("origin");
  if (req.method === "GET" || req.method === "HEAD" || !origin) return next();
  if (new URL(origin).host !== (req.get("x-forwarded-host") ?? req.get("host"))) {
    return next(new HttpError(403, "Cross-site request blocked"));
  }
  next();
};

export function createApp() {
  const app = express();
  app.set("trust proxy", true); // Cloud Run and other proxies sit in front
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "img-src": ["'self'", "data:", "https:"],
          // The proxy terminates TLS; upgrading would break plain-http local runs.
          "upgrade-insecure-requests": null,
        },
      },
    }),
  );

  // Better Auth reads the raw body itself (the Stripe webhook needs it), so it
  // is mounted before the JSON parser.
  app.all("/api/auth/{*any}", toNodeHandler(auth));

  app.use(express.json({ limit: "100kb" }));
  app.use("/api", metaRoutes);
  app.use("/api/v1", v1Routes);
  app.use("/api", sameOrigin);
  app.use("/api", workspaceRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api", (_req, _res, next) => next(new HttpError(404, "Not found")));

  // The built React app. Unknown paths get index.html so client routes survive a refresh.
  if (fs.existsSync(clientDir)) {
    app.use("/assets", express.static(path.join(clientDir, "assets"), { immutable: true, maxAge: "1y" }));
    app.use(express.static(clientDir, { index: false }));
    app.get("/{*any}", (_req, res) => {
      res.set("Cache-Control", "no-cache").sendFile(path.join(clientDir, "index.html"));
    });
  }

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) return res.status(400).json({ error: err.issues[0]?.message ?? "Invalid input" });
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, code: err.code });
    if (err?.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON" });
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  };
  app.use(onError);
  return app;
}
