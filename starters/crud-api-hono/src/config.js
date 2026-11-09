// All configuration comes from the environment, read once here.
export const config = {
  port: Number(process.env.PORT) || 8080,
  databaseUrl: process.env.DATABASE_URL || "postgres://localhost:5432/postgres",
};
