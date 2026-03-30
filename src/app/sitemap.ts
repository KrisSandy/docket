import type { MetadataRoute } from 'next';

const BASE_URL = 'https://homedocket.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = [
    'nct-due-date-ireland',
    'track-household-bills-ireland',
    'motor-tax-renewal-ireland',
  ];

  return [
    {
      url: BASE_URL,
      lastModified: new Date('2026-03-31'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date('2026-03-31'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogPosts.map((slug) => ({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: new Date('2026-03-31'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date('2026-03-31'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date('2026-03-31'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
