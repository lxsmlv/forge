import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://forgeclub.app', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://forgeclub.app/about', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://forgeclub.app/terms', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://forgeclub.app/privacy', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];
}
