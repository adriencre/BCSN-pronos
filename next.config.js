// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // next-pwa uses webpack, so we add an empty turbopack config to silence the error
  // and let Next.js know we're aware of it
  turbopack: {},
};

module.exports = withPWA(nextConfig);
