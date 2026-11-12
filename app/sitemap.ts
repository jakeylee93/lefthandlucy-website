import type { MetadataRoute } from 'next'

// One page; always the real domain, never a testing address.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: 'https://www.lefthandlucy.com/', changeFrequency: 'monthly', priority: 1 }]
}
