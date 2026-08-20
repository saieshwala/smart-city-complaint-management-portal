/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@civicconnect/types", "@civicconnect/utils"],
};

module.exports = nextConfig;
