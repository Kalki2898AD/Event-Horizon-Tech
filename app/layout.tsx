import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import Script from 'next/script';
import AuthProvider from './providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Event Horizon Tech - Latest Technology News and Updates',
  description: 'Stay updated with the latest technology news, reviews, and insights. Event Horizon Tech brings you comprehensive coverage of tech innovations, gadgets, and digital trends.',
  keywords: 'technology news, tech updates, digital trends, tech reviews, Event Horizon Tech',
  openGraph: {
    title: 'Event Horizon Tech - Latest Technology News and Updates',
    description: 'Stay updated with the latest technology news, reviews, and insights.',
    url: 'https://eventhorizonlive.space',
    siteName: 'Event Horizon Tech',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'vVLV_ZoSTdieaP_NDwJTuk02mo_bz38IEAaJnkGpmko',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9131964371118756"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <meta name="google-site-verification" content="vVLV_ZoSTdieaP_NDwJTuk02mo_bz38IEAaJnkGpmko" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
