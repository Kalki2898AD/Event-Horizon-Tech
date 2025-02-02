import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import AuthProvider from './providers/AuthProvider';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Event Horizon Tech',
  description: 'Stay updated with the latest technology news and developments',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <Suspense fallback={<div className="h-16 bg-white shadow-md" />}>
            <Navbar />
          </Suspense>
          <main>
            <Suspense fallback={<div className="min-h-screen animate-pulse bg-gray-50" />}>
              {children}
            </Suspense>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
