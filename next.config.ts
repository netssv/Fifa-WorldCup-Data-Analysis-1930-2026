import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external computers in the local network to view the dev environment
  allowedDevOrigins: ["192.168.68.56", "localhost:3000", "192.168.68.56:3000"]
};

export default nextConfig;
