/**
 * anyvendor.site/v1 for Left Hand Lucy: the manifest, the full content seed,
 * the field-to-element map, and the reader that turns saved content back into
 * what the renderer shows. Everything is derived from model.ts, so the editor
 * and the public page can never describe different fields.
 *
 * Contract read on 12 Nov 2026 from jakeylee93/anyvendor@1f2379e:
 * docs/backend/SITE-CONTENT-CONTRACT-v1.md and HANDOFF-TL-SITE-BRIDGE.md.
 */
import { DEFAULT_LAYOUT, SECTION_DEFS, SITE_KEY, type FieldDef, type SectionInstance, type SectionKind } from './model'
import { SERVICES } from '../site-data'

type V1Type = 'text' | 'textarea' | 'image' | 'link' | 'list' | 'select' | 'boolean'
interface V1Field { key: string; type: V1Type; label: string; max?: number; fields?: V1Field[]; options?: { value: string; label: string }[] }
interface V1Section { key: string; label: string; help?: string; fields: V1Field[] }
type Row = Record<string, unknown>
export type V1Content = Record<string, Record<string, unknown>>

/** Chapters the owner can reorder, hide, remove and add back. The introduction always opens the page. */
export const CHAPTERS: { key: string; kind: SectionKind; label: string }[] = [
  { key: 'services', kind: 'services', label: 'How I can help' },
  { key: 'about', kind: 'about', label: 'About Lucy' },
  { key: 'testimonials', kind: 'testimonials', label: 'Kind words' },
  { key: 'contact', kind: 'contact', label: 'Contact' },
]
export const KEEP_VISIBLE = ['contact']
const IMAGE_ALT: Record<string, string> = { 'hero.image': 'Lucy smiling on a bench in Madrid', 'about.image': 'Lucy' }
const EMAIL_FIELD = 'contact.card.email.value'
const MAX_QUOTES = 6
const MAX_INCLUDES = 8

const snake = (id: string) => id.replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase()
/** Field key inside its section: the model ID without the section prefix, in lower_snake_case. */
const fieldKey = (kind: SectionKind, id: string) => snake(id.startsWith(`${kind}.`) ? id.slice(kind.length + 1) : id)
const isInclude = (id: string) => /^services\.[a-z]+\.item\d+$/.test(id)
const isQuote = (id: string) => /^testimonials\.t\d+\./.test(id)

/** Every single-value field: its section, key and the data-anyos key the renderer already uses. */
function scalarFields() {
  const out: { section: string; key: string; def: FieldDef }[] = []
  for (const def of Object.values(SECTION_DEFS)) {
    if (def.kind === 'custom') continue
    for (const field of def.fields) if (!isInclude(field.id) && !isQuote(field.id)) out.push({ section: def.kind, key: fieldKey(def.kind, field.id), def: field })
  }
  return out
}

/** data-anyos / data-anyos-img key → "section.field" (the data-av-field value). */
export const AV_PATHS: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const { section, key, def } of scalarFields()) map[def.id] = `${section}.${key}`
  for (const service of SERVICES) service.includes.forEach((_, i) => { map[`services.${service.id}.item${i + 1}`] = `services.${service.id}_includes.${i}.text` })
  return map
})()

export function buildV1(saved: Record<string, string> = {}) {
  const value = (field: FieldDef) => saved[field.id] ?? field.default
  const sections: V1Section[] = [{ key: 'page', label: 'Page layout', help: 'The introduction always opens the page. Choose which chapters follow, and in what order.', fields: [
    { key: 'chapters', label: 'Chapters after the introduction', type: 'list', max: CHAPTERS.length, fields: [
      { key: 'chapter', label: 'Chapter', type: 'select', options: CHAPTERS.map(chapter => ({ value: chapter.key, label: chapter.label })) },
      { key: 'visible', label: 'Show on the page', type: 'boolean' },
    ] },
  ] }]
  const content: V1Content = { page: { chapters: CHAPTERS.map(chapter => ({ chapter: chapter.key, visible: true })) } }
  const elements: Record<string, { attr: string; anyosKey?: string; note?: string }> = { 'page.chapters': { attr: 'data-av-chapter', note: 'one wrapper per chapter: services, about, testimonials, contact' } }

  for (const def of Object.values(SECTION_DEFS)) {
    if (def.kind === 'custom') continue
    const fields: V1Field[] = []
    const values: Record<string, unknown> = {}
    for (const { section, key, def: field } of scalarFields().filter(entry => entry.section === def.kind)) {
      const type: V1Type = field.id === EMAIL_FIELD ? 'link' : field.type === 'longtext' ? 'textarea' : field.type === 'link' ? 'text' : field.type
      fields.push({ key, type, label: field.group ? `${field.group.toUpperCase()}: ${field.label}` : field.label, ...(type === 'text' ? { max: 160 } : type === 'textarea' ? { max: 1200 } : {}) })
      values[key] = type === 'image' ? { src: value(field), alt: IMAGE_ALT[field.id] || '' } : type === 'link' ? { href: `mailto:${value(field)}`, label: value(field) } : value(field)
      elements[`${section}.${key}`] = { attr: 'data-av-field', anyosKey: field.id }
    }
    if (def.kind === 'services') for (const service of SERVICES) {
      const key = `${service.id}_includes`
      fields.push({ key, type: 'list', label: `${service.id.toUpperCase()}: what is included`, max: MAX_INCLUDES, fields: [{ key: 'text', label: 'Line', type: 'text', max: 80 }] })
      values[key] = service.includes.map((item, i) => ({ text: saved[`services.${service.id}.item${i + 1}`] ?? item }))
      service.includes.forEach((_, i) => { elements[`services.${key}.${i}.text`] = { attr: 'data-av-field', anyosKey: `services.${service.id}.item${i + 1}` } })
    }
    if (def.kind === 'testimonials') {
      // One row per real quote. Template placeholders are never seeded: only quotes whose words AND name the owner saved.
      fields.push({ key: 'items', type: 'list', label: 'Quotes', max: MAX_QUOTES, fields: [
        { key: 'text', label: 'Their words', type: 'textarea', max: 600 }, { key: 'name', label: 'Name', type: 'text', max: 80 },
        { key: 'role', label: 'Role', type: 'text', max: 80 }, { key: 'service', label: 'Service', type: 'text', max: 80 } ] })
      const rows: Row[] = []
      for (let n = 1; n <= 5; n++) {
        const text = saved[`testimonials.t${n}.text`], name = saved[`testimonials.t${n}.name`]
        if (!text || !name) continue
        ;(['text', 'name', 'role', 'service'] as const).forEach(sub => { elements[`testimonials.items.${rows.length}.${sub}`] = { attr: 'data-av-field', anyosKey: `testimonials.t${n}.${sub}` } })
        rows.push({ text, name, role: saved[`testimonials.t${n}.role`] ?? '', service: saved[`testimonials.t${n}.service`] ?? '' })
      }
      values.items = rows
    }
    sections.push({ key: def.kind, label: def.label, fields })
    content[def.kind] = values
  }
  return { schema: 'anyvendor.site/v1', slug: SITE_KEY, kind: 'bespoke', manifest: { version: 1, name: 'Left Hand Lucy', sections }, content, elements }
}

// ── Reading saved content back ───────────────────────────────────────────

export interface AvQuote { text: string; name: string; role: string; service: string }
export interface AvView {
  /** data-anyos key → saved text. A key that is present wins over the built-in text, even when empty. */
  fields: Record<string, string>
  images: Record<string, { src: string; alt: string }>
  email: { href: string; label: string } | null
  includes: Record<string, string[]>
  quotes: AvQuote[]
  layout: SectionInstance[]
}

const str = (value: unknown, max: number) => (typeof value === 'string' ? value.slice(0, max) : null)
const safeImage = (src: unknown) => typeof src === 'string' && src.length <= 2000 && (/^https:\/\/[^\s<>"'`\\]+$/.test(src) || /^\/(?!\/)[A-Za-z0-9/_.~%-]*$/.test(src)) ? src : null

/** Chapter rows → the renderer's layout. Introduction first; contact always present and visible. */
export function layoutFromChapters(rows: unknown): SectionInstance[] {
  const hero = DEFAULT_LAYOUT.find(section => section.kind === 'hero')!
  const out: SectionInstance[] = [hero]
  if (Array.isArray(rows)) for (const row of rows.slice(0, 40)) {
    const chapter = CHAPTERS.find(entry => entry.key === (row as Row)?.chapter)
    if (!chapter || out.some(section => section.kind === chapter.kind)) continue
    out.push({ id: SECTION_DEFS[chapter.kind].anchor, kind: chapter.kind, hidden: (row as Row).visible !== true && !KEEP_VISIBLE.includes(chapter.key) })
  }
  if (!out.some(section => section.kind === 'contact')) out.push({ id: 'contact', kind: 'contact', hidden: false })
  return out
}

/** Defensive read of anyvendor.site/v1 content. Anything missing or malformed keeps the built-in value. */
export function viewFromV1(content: unknown): AvView {
  const c = (content && typeof content === 'object' ? content : {}) as V1Content
  const view: AvView = { fields: {}, images: {}, email: null, includes: {}, quotes: [], layout: layoutFromChapters(c.page?.chapters) }
  for (const { section, key, def } of scalarFields()) {
    const raw = c[section]?.[key]
    if (def.type === 'image') { const image = raw as Row | undefined; const src = safeImage(image?.src); if (src) view.images[def.id] = { src, alt: str(image?.alt, 200) ?? '' } }
    else if (def.id === EMAIL_FIELD) { const link = raw as Row | undefined; const href = str(link?.href, 400), label = str(link?.label, 160); if (href && /^(mailto:|https:\/\/|tel:)/.test(href) && label) { view.email = { href, label }; view.fields[def.id] = label } }
    else { const text = str(raw, 10000); if (text !== null) view.fields[def.id] = text }
  }
  for (const service of SERVICES) {
    const rows = c.services?.[`${service.id}_includes`]
    if (Array.isArray(rows)) view.includes[service.id] = rows.slice(0, MAX_INCLUDES).map(row => str((row as Row)?.text, 80) ?? '').filter(Boolean)
  }
  const quotes = c.testimonials?.items
  if (Array.isArray(quotes)) for (const row of quotes.slice(0, MAX_QUOTES) as Row[]) {
    const text = str(row?.text, 600)?.trim(), name = str(row?.name, 80)?.trim()
    if (text && name) view.quotes.push({ text, name, role: str(row.role, 80) ?? '', service: str(row.service, 80) ?? '' })
  }
  return view
}
