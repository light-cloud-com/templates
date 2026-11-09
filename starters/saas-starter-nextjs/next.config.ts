import type { NextConfig } from "next";

// No `output: "export"`: the app needs a server (auth, database, API), so Light Cloud runs it as a container.
const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default nextConfig;
