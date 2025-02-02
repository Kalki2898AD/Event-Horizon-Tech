import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'images.nintendolife.com',
      'techcrunch.com',
      'www.techcrunch.com',
      'venturebeat.com',
      'www.venturebeat.com',
      'cdn.vox-cdn.com',
      'images.theverge.com',
      'www.theverge.com',
      'arstechnica.com',
      'www.arstechnica.com',
      'mashable.com',
      'www.mashable.com',
      'engadget.com',
      'www.engadget.com',
      'techradar.com',
      'www.techradar.com',
      'cnet.com',
      'www.cnet.com',
      'zdnet.com',
      'www.zdnet.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
