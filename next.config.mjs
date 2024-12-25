/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Webpack customization for `node-fetch`
  webpack: (config) => {
    config.externals = {
      ...config.externals,
      'node-fetch': 'commonjs node-fetch',
    };
    return config;
  },

  // Optionally disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
