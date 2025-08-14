/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@ashbuk/spark-slider'],
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
