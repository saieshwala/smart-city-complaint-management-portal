/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,
  transpilePackages: ["@civicconnect/types", "@civicconnect/utils"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4001/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
