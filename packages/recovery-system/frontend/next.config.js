/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  typescript: {
    // TypeScript errors will be shown during development
    ignoreBuildErrors: false,
  },
  async rewrites() {
    return [
      {
        // Proxy all /api/* requests to the backend during development
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
