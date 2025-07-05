/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Temporarily disable ESLint during builds to focus on functionality
    ignoreDuringBuilds: true,
    dirs: ['src'],
  },
  webpack: (config) => {
    // Handle pino-pretty and other optional dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      path: false,
      os: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      'pino-pretty': false,
    };

    // Ignore pino-pretty as it's not needed in browser
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false,
    };

    // Handle ESM modules
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
  // Suppress hydration warnings for Web3 components
  experimental: {
    optimizePackageImports: ['@rainbow-me/rainbowkit', 'wagmi'],
  },
};

module.exports = nextConfig;
