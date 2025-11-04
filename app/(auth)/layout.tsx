import '@/app/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MediaKit — Toolkit for Content Creators',
  description: 'Image to video, subtitle automation, background removal and audio editing — all in one toolkit.',
  openGraph: {
    title: 'MediaKit',
    description: 'Toolkit for Content Creators',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-slate-100 antialiased">
        {/* Navbar is a client component */}
        <Navbar />

        <div className="w-fit mx-auto p-6 lg:px-8 min-h-[calc(100vh-176px)] pt-4 px-4 md:px-8  flex gap-6">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}
