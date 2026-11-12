/**
 * Server-side reader for AnyVendor content (anyvendor.site/v1). Server only:
 * it holds no key or credential, and the draft token never reaches a browser
 * request made by this site.
 */
import 'server-only'
import { SITE_KEY } from './model'

const ORIGIN = (process.env.ANYVENDOR_CONTENT_ORIGIN || 'https://anyvendor.co.uk').replace(/\/$/, '')
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export interface SiteV1 { schema: string; mode: 'published' | 'draft'; revision: string; content: unknown }

async function read(url: string, init: RequestInit): Promise<SiteV1 | null> {
  try {
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) })
    if (!response.ok) return null
    const data = await response.json()
    if (data?.schema !== 'anyvendor.site/v1' || data?.business?.slug !== SITE_KEY || typeof data.content !== 'object' || !data.content) return null
    return data as SiteV1
  } catch { return null }
}

/** Published content, or null (unknown, unpublished or unreachable): the page then keeps its built-in content. */
export const sitePublished = () => read(`${ORIGIN}/api/sites/${SITE_KEY}/content`, { next: { revalidate: 60, tags: ['anyvendor'] } } as RequestInit)

/** Draft for a preview token. Null for a missing, malformed or wrong token, and for anything that is not a draft. Never cached. */
export async function siteDraft(token: unknown): Promise<SiteV1 | null> {
  if (typeof token !== 'string' || !UUID.test(token)) return null
  const site = await read(`${ORIGIN}/api/sites/${SITE_KEY}/content?preview=${encodeURIComponent(token)}`, { cache: 'no-store' })
  return site?.mode === 'draft' ? site : null
}

/** Exact editor origins allowed to frame and talk to the draft page. */
export function editorOrigins(): string[] {
  const extra = (process.env.ANYVENDOR_EDITOR_ORIGINS || '').split(',').map(origin => origin.trim())
  return Array.from(new Set(['https://platform.anyvendor.co.uk', ...extra])).filter(origin => /^https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(origin))
}
