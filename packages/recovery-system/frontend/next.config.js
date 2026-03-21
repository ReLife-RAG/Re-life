/** @type {import('next').NextConfig} */
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

  // Proxy /uploads requests from Next.js dev server → backend
  // This means <img src="/uploads/file.png" /> also works (relative URL)
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/:path*`,
      },
      // Proxy all /api calls to backend (if not already present)
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;