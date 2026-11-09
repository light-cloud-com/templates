import { defineConfig } from "drizzle-kit";

// `npm run db:generate` writes SQL migrations into drizzle/; scripts/migrate.mjs applies them on start.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
});
