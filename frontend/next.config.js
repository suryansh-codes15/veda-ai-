/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/assignments',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
