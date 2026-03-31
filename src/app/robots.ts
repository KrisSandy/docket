import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/item/', '/add/', '/settings/', '/history/'],
      },
    ],
    sitemap: 'https://homedocket.app/sitemap.xml',
  };
}
