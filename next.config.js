/** @type {import('next').NextConfig} */
// Exact editor origins that may frame the draft page (same rule as app/content/anyvendor-server.ts).
const editorOrigins = Array.from(new Set(['https://platform.anyvendor.co.uk', ...(process.env.ANYVENDOR_EDITOR_ORIGINS || '').split(',').map(o => o.trim())]))
  .filter(o => /^https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(o))

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  async headers() {
    return [{
      // The draft page: its address carries the draft token. Never cached, indexed or leaked by referrer,
      // and frameable only by the AnyVendor editor. These apply to its 404 as well.
      source: '/preview',
      headers: [
        { key: 'Cache-Control', value: 'no-store' },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'Content-Security-Policy', value: `frame-ancestors 'self' ${editorOrigins.join(' ')}` },
      ],
    }]
  },
}
module.exports = nextConfig
