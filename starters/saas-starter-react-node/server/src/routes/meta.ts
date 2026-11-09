import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { config } from "../config.ts";
import type { AppConfig } from "../../../shared/schemas.ts";

export const metaRoutes = Router();

metaRoutes.get("/health", async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unavailable", error: "Database is not reachable" });
  }
});

metaRoutes.get("/config", (_req, res) => {
  const body: AppConfig = {
    appName: config.appName,
    emailEnabled: !!config.email,
    billingEnabled: !!config.stripe,
    providers: { github: !!config.github, google: !!config.google },
  };
  res.json(body);
});
