/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@ashbuk/spark-slider'],
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
