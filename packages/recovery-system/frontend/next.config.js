/** @type {import('next').NextConfig} */
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const backendBase = rawApiUrl.replace(/\/$/, '').replace(/\/api$/, '');

const nextConfig = {
  images: {
    // Allow Next.js <Image> to load from the backend dev server and Cloudinary
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        pathname: '/**',
      },
      {
        // randomuser.me avatars used for counselor seed data
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/**',
      },
    ],
  },

  // Proxy /uploads requests from Next.js dev server → backend (dev only)
  // In production, images are served by backend via NEXT_PUBLIC_API_URL
  async rewrites() {
    return {
      beforeFiles: [
        // Only proxy /uploads in development
        process.env.NODE_ENV === 'development'
          ? {
              source: '/uploads/:path*',
              destination: `${backendBase}/uploads/:path*`,
            }
          : null,
      ].filter(Boolean),
    };
  },
};

module.exports = nextConfig;