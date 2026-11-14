import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sarvamai'],
  allowedDevOrigins: [
    'exposure-citizen-ease-sacrifice.trycloudflare.com',
    '*.trycloudflare.com',
    '*.ngrok-free.app',
    'localhost:3000',
  ],
};

export default nextConfig;
