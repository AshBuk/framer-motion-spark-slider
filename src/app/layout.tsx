import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Framer Motion Spark Slider',
  description: 'Open-source slider built with Framer Motion and Next.js',
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
      <body className='min-h-screen bg-neutral-950 font-sans text-white'>
        {children}
      </body>
    </html>
  );
}
