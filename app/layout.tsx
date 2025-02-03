import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import Script from 'next/script';
import AuthProvider from './providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://eventhorizonlive.space'),
  title: 'Event Horizon Tech - Latest Technology News and Updates',
  description: 'Stay updated with the latest technology news, reviews, and insights. Get daily updates on tech innovations, gadgets, software, and digital trends.',
  keywords: 'tech news, technology updates, digital trends, software news, gadget reviews, tech innovation',
  authors: [{ name: 'Event Horizon Tech' }],
  creator: 'Event Horizon Tech',
  publisher: 'Event Horizon Tech',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://eventhorizonlive.space',
    title: 'Event Horizon Tech - Latest Technology News and Updates',
    description: 'Stay updated with the latest technology news, reviews, and insights.',
    siteName: 'Event Horizon Tech',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Event Horizon Tech - Latest Technology News',
    description: 'Stay updated with the latest technology news and insights.',
  },
  verification: {
    google: 'vVLV_ZoSTdieaP_NDwJTuk02mo_bz38IEAaJnkGpmko',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
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
          strategy="beforeInteractive"
        />
        <meta name="google-adsense-account" content="ca-pub-9131964371118756" />
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
