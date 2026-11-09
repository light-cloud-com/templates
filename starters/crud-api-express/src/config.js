// All configuration comes from the environment, read once here.
export const config = {
  port: Number(process.env.PORT) || 8080,
  // Light Cloud sets DATABASE_URL with sslmode=require&uselibpqcompat=true:
  // TLS on, certificate not verified (the database's certificate is platform-internal).
  databaseUrl: process.env.DATABASE_URL,
};
