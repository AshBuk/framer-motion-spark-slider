/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

import type { Metadata, Viewport } from 'next';
import './globals.css';
import '@/components/SparkSlider/spark-slider.css';

export const metadata: Metadata = {
  title: 'Framer Motion Spark Slider',
  description: 'Open-source slider built with Framer Motion and Next.js',
  icons: '/favicon/favicon-32x32.png',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className='h-full' suppressHydrationWarning>
      <body className='min-h-[100svh] bg-black font-sans text-white'>
        {children}
      </body>
    </html>
  );
}
