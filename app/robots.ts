import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/'],
      },
      {
        userAgent: 'Mediapartners-Google',
        allow: '/',
      },
      {
        userAgent: 'Adsbot-Google',
        allow: '/',
      },
    ],
    sitemap: 'https://eventhorizonlive.space/sitemap.xml',
  };
}
