import './globals.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MediaKit — Toolbox for Content Creators',
  description: 'Image to video, subtitle automation, background removal and audio editing — all in one toolkit.',
  openGraph: {
    title: 'MediaKit',
    description: 'Toolbox for Content Creators',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
        {/* Navbar is a client component */}
        <Navbar />

        <div className="min-h-[calc(100vh-64px)] pt-4 px-4 md:px-8 lg:px-12 flex gap-6">
          {/* Sidebar is client; it's lightweight and memoized */}
          <aside className="hidden md:block w-64">
            <Sidebar />
          </aside>

          <main className="flex-1 max-w-[1200px] mx-auto">
            {children}
          </main>
        </div>

        <Footer />
      </body>
    </html>
  );
}
