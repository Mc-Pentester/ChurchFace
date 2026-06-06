/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  serverExternalPackages: ["@prisma/client", "prisma"],

  /* Réduire la consommation mémoire pendant le build */
  experimental: {
    workerThreads: false,
  },
  staticPageGenerationTimeout: 120,
};

module.exports = nextConfig;