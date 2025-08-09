import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Framer Motion Ideas Slider',
  description: 'Open-source ideas slider built with Framer Motion and Next.js',
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
      <body
        className={`${inter.className} min-h-screen bg-neutral-950 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
