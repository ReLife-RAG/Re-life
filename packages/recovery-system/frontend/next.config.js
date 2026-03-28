/** @type {import('next').NextConfig} */
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const backendBase = rawApiUrl.replace(/\/$/, '').replace(/\/api$/, '');
const rawChatApiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:8000';
const chatBackendBase = rawChatApiUrl.replace(/\/$/, '').replace(/\/api$/, '');

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

  // Proxy backend resources through Next.js so browser requests stay same-origin.
  // This avoids cross-site cookie/session issues in production.
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendBase}/uploads/:path*`,
      },
      {
        source: '/api/chat/:path*',
        destination: `${chatBackendBase}/api/chat/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;