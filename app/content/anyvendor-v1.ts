/**
 * anyvendor.site/v1 view of the content model: manifest, full content seed and
 * the field-to-element map. Derived from model.ts so the editor and the public
 * renderer can never describe different fields.
 *
 * PROVISIONAL: the backend owner is extending this to v1.1 (editable section
 * instances + validated preview bridge). Nothing here is frozen until that
 * exact schema is shared.
 */
import { SECTION_DEFS, SITE_KEY, type FieldDef, type SectionKind } from './model'
import { SERVICES } from '../site-data'

export type V1Type = 'text' | 'textarea' | 'image' | 'link' | 'list'
export interface V1Field { key: string; type: V1Type; label: string; max?: number }
export interface V1Section { key: string; label: string; fields: V1Field[] }
type V1Value = string | string[] | { src: string; alt: string } | { href: string; label: string }

const snake = (id: string) => id.replace(/[^a-zA-Z0-9]+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
const SECTION_KEYS: Record<SectionKind, string> = { hero: 'hero', services: 'services', about: 'about', testimonials: 'testimonials', contact: 'contact', custom: 'custom' }
const IMAGE_ALT: Record<string, string> = { 'hero.image': 'Lucy smiling on a bench in Madrid', 'about.image': 'Lucy' }
const LINK_HREF: Record<string, string> = { 'contact.card.email.value': 'mailto:Lucy@lefthandlucy.com' }

/** Field key inside its section: the model ID without the section prefix, in lower_snake_case. */
function fieldKey(kind: SectionKind, id: string) {
  const prefix = `${kind === 'testimonials' ? 'testimonials' : kind}.`
  return snake(id.startsWith(prefix) ? id.slice(prefix.length) : id)
}

export function buildV1(saved: Record<string, string> = {}) {
  const sections: V1Section[] = []
  const content: Record<string, Record<string, V1Value>> = {}
  // "section.field" → how the renderer marks the element(s) it fills.
  const elements: Record<string, { attr: 'data-anyos' | 'data-anyos-img'; key: string } | { attr: 'data-anyos'; keys: string[] }> = {}
  const value = (field: FieldDef) => saved[field.id] ?? field.default

  for (const def of Object.values(SECTION_DEFS)) {
    if (def.kind === 'custom') continue
    const sectionKey = SECTION_KEYS[def.kind]
    const fields: V1Field[] = []
    const values: Record<string, V1Value> = {}
    const listed = new Set<string>()
    if (def.kind === 'services') for (const service of SERVICES) {
      // The six "included" lines of each service are one flat list field.
      const items = def.fields.filter(field => field.id.startsWith(`services.${service.id}.item`))
      items.forEach(item => listed.add(item.id))
      const key = `${service.id}_includes`
      fields.push({ key, type: 'list', label: `${service.id.toUpperCase()} — what is included`, max: 8 })
      values[key] = items.map(value)
      elements[`${sectionKey}.${key}`] = { attr: 'data-anyos', keys: items.map(item => item.id) }
    }
    for (const field of def.fields) {
      if (listed.has(field.id)) continue
      const key = fieldKey(def.kind, field.id)
      const type: V1Type = field.type === 'longtext' ? 'textarea' : field.type
      fields.push({ key, type, label: field.group ? `${field.group.toUpperCase()} — ${field.label}` : field.label, ...(type === 'text' ? { max: 160 } : type === 'textarea' ? { max: 1200 } : {}) })
      values[key] = type === 'image' ? { src: value(field), alt: IMAGE_ALT[field.id] || '' } : type === 'link' ? { href: LINK_HREF[field.id] || '', label: value(field) } : value(field)
      elements[`${sectionKey}.${key}`] = { attr: field.type === 'image' ? 'data-anyos-img' : 'data-anyos', key: field.id }
    }
    sections.push({ key: sectionKey, label: def.label, fields })
    content[sectionKey] = values
  }
  return { schema: 'anyvendor.site/v1', manifest: { version: 1, name: 'Left Hand Lucy', slug: SITE_KEY, sections }, content, elements }
}
