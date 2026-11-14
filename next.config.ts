import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sarvamai'],
  allowedDevOrigins: [
    'defense-smtp-wing-require.trycloudflare.com',
    'exposure-citizen-ease-sacrifice.trycloudflare.com',
    '*.trycloudflare.com',
    '*.ngrok-free.app',
    'localhost:3000',
    '127.0.0.1:3000',
  ],
};

export default nextConfig;
