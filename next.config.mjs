/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  webpack: (config) => {
    // Correct `externals` syntax for `node-fetch`
    config.externals = config.externals || [];
    config.externals.push({ 'node-fetch': 'commonjs node-fetch' });

    return config;
  },

  eslint: {
    // Disable ESLint during builds if necessary
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
