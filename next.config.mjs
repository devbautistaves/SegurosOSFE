/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build standalone para servir el FE en el VPS vía pm2 (node .next/standalone/server.js)
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
