/**
 * Content sources (adapters). The renderer only ever sees SiteContent.
 *
 *  - anyOS (current, live): reads the existing public content API. Text and
 *    images are also hydrated in place by edit.js; the layout is read from the
 *    optional "__layout_v1" key. anyOS has no draft state, so "draft" returns
 *    the published content.
 *  - AnyVendor is read on the SERVER (anyvendor-server.ts), never from here.
 */
import { DEFAULT_LAYOUT, parseLayout, SITE_KEY, type SiteContent } from './model'

export interface ContentSource { name: 'anyos'; load(state: 'published' | 'draft'): Promise<SiteContent> }

const ANYOS_CONTENT = `https://platform.anyos.co.uk/api/site-cms/${SITE_KEY}/content`

async function getJson(url: string) {
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
  if (!response.ok) throw new Error(`content ${response.status}`)
  const raw = await response.text()
  if (raw.length > 500000) throw new Error('content too large')
  return JSON.parse(raw)
}

const stringMap = (value: unknown): Record<string, string> => {
  const out: Record<string, string> = {}
  if (value && typeof value === 'object') for (const [key, entry] of Object.entries(value as Record<string, unknown>)) if (typeof entry === 'string') out[key] = entry
  return out
}

export const anyosSource: ContentSource = {
  name: 'anyos',
  async load() {
    const data = await getJson(ANYOS_CONTENT)
    const fields = stringMap(data?.content)
    return { revision: null, state: 'published', layout: parseLayout(fields['__layout_v1'] ?? DEFAULT_LAYOUT), fields }
  },
}

export const contentSource: ContentSource = anyosSource

/** Plain text of a saved value (saved values may contain simple HTML such as "<br />" or "&amp;"). */
export function plainText(value: unknown) {
  if (typeof value !== 'string') return ''
  return (new DOMParser().parseFromString(value, 'text/html').body.textContent || '').trim()
}
