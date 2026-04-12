/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
    serverActions: {
      allowedOrigins: ["class7.xuanjian.top", "*.xuanjian.top", "dxxs3.com", "*.dxxs3.com"],
    },
  },
};

module.exports = nextConfig;
