import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Configuración optimizada para Vercel & Producción */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
