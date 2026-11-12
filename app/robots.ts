import type { MetadataRoute } from 'next'

// Testing copies (LHL_TESTING=1) are closed to crawlers; the real site is open except the draft page.
export default function robots(): MetadataRoute.Robots {
  if (process.env.LHL_TESTING === '1') return { rules: { userAgent: '*', disallow: '/' } }
  return { rules: { userAgent: '*', allow: '/', disallow: ['/preview', '/site-manifest', '/anyos-manifest'] }, sitemap: 'https://www.lefthandlucy.com/sitemap.xml', host: 'https://www.lefthandlucy.com' }
}
