/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  output: "standalone",

  serverExternalPackages: ["@prisma/client", "prisma"],

  experimental: {
    workerThreads: false,
  },

  staticPageGenerationTimeout: 120,
};

module.exports = nextConfig;