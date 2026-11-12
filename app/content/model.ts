/**
 * Typed content model shared by the public renderer and any visual editor.
 *
 * A site is an ordered list of SECTIONS (layout) plus a flat map of FIELDS.
 * Field IDs are the same stable keys the page already carries as
 * data-anyos / data-anyos-img attributes, so content saved by the current
 * anyOS editor is valid in this model without migration.
 */
import { translations } from '../translations'
import { SERVICES, TESTIMONIALS } from '../site-data'

export const SITE_KEY = 'left-hand-lucy'
export const MODEL_VERSION = 1

export type SectionKind = 'hero' | 'services' | 'about' | 'testimonials' | 'contact' | 'custom'
export type FieldType = 'text' | 'longtext' | 'image' | 'link'
export interface FieldDef { id: string; type: FieldType; label: string; default: string; group?: string; placeholderOnly?: boolean }
export interface SectionDef { kind: SectionKind; label: string; anchor: string; single: boolean; removable: boolean; fields: FieldDef[] }
export interface SectionInstance { id: string; kind: SectionKind; hidden: boolean }
export interface SiteContent { revision: string | null; state: 'published' | 'draft'; layout: SectionInstance[]; fields: Record<string, string> }

const en = translations.en
const text = (id: string, label: string, type: FieldType = 'text', fallback = ''): FieldDef => ({ id, type, label, default: en[id] ?? fallback })

export const SECTION_DEFS: Record<SectionKind, SectionDef> = {
  hero: { kind: 'hero', label: 'Introduction', anchor: 'home', single: true, removable: false, fields: [
    text('hero.tags', 'Small heading'), text('hero.title', 'Name', 'text', 'Left Hand Lucy'), text('hero.tagline', 'Tagline'), text('hero.intro', 'Introduction', 'longtext'),
    text('hero.availability', 'Where and how Lucy works'), text('about.tag.madrid', 'Location note'),
    text('hero.cta1', 'First button'), text('hero.cta2', 'Second button'),
    { id: 'hero.image', type: 'image', label: 'Portrait', default: '/images/lucy-hero.jpg' },
  ] },
  services: { kind: 'services', label: 'Services', anchor: 'services', single: true, removable: true, fields: [
    text('services.label', 'Small heading'), text('services.title', 'Heading'),
    ...SERVICES.flatMap(service => [
      { ...text(`services.${service.id}.title`, 'Service name'), group: service.id },
      { ...text(`services.${service.id}.desc`, 'Description', 'longtext'), group: service.id },
      ...service.includes.map((item, i): FieldDef => ({ id: `services.${service.id}.item${i + 1}`, type: 'text', label: `Included ${i + 1}`, default: item, group: service.id })),
      { id: `services.${service.id}.cta`, type: 'text' as const, label: 'Button', default: 'Get in touch', group: service.id },
    ]),
  ] },
  about: { kind: 'about', label: 'About Lucy', anchor: 'about', single: true, removable: true, fields: [
    text('about.label', 'Small heading'), { ...text('about.title1', 'Heading'), id: 'about.title' }, text('about.title2', 'Sub-heading'),
    ...[1, 2, 3, 4].map(i => text(`about.p${i}`, `Paragraph ${i}`, 'longtext')),
    text('about.badge', 'Badge'), text('about.badge.sub', 'Badge detail'),
    ...['english', 'teacher', 'planner'].map(id => text(`about.tag.${id}`, 'Tag')), text('about.cta', 'Link text'),
    { id: 'about.image', type: 'image', label: 'Photo', default: '/images/lucy-portrait-1200.jpg' },
  ] },
  // Template quotes are placeholders only: a quote is public only once its
  // text AND name have been saved by the site owner.
  testimonials: { kind: 'testimonials', label: 'Kind words', anchor: 'kind-words', single: true, removable: true, fields: [
    text('testimonials.label', 'Small heading'), text('testimonials.title', 'Heading'),
    ...TESTIMONIALS.flatMap(item => (['text', 'name', 'role', 'service'] as const).map((key): FieldDef => ({ id: `testimonials.${item.id}.${key}`, type: key === 'text' ? 'longtext' : 'text', label: key, default: '', group: item.id, placeholderOnly: true }))),
  ] },
  contact: { kind: 'contact', label: 'Contact', anchor: 'contact', single: true, removable: false, fields: [
    text('contact.label', 'Small heading'), text('contact.title', 'Heading'), text('contact.desc', 'Introduction', 'longtext'),
    { id: 'contact.card.email.value', type: 'link', label: 'Email', default: 'Lucy@lefthandlucy.com' },
    { id: 'contact.card.whatsapp.value', type: 'text', label: 'WhatsApp label', default: 'Message me' },
    { id: 'contact.card.location.value', type: 'text', label: 'Location', default: 'Madrid, Spain' },
    text('contact.service', 'Form question'), text('contact.send', 'Send button'), text('contact.sent', 'Sent message'),
  ] },
  // Extra modules added in the editor (anyOS "__sections" / "__sections_v1").
  custom: { kind: 'custom', label: 'Added sections', anchor: 'more', single: true, removable: true, fields: [] },
}

export const DEFAULT_LAYOUT: SectionInstance[] = (['hero', 'services', 'about', 'testimonials', 'custom', 'contact'] as const).map(kind => ({ id: SECTION_DEFS[kind].anchor, kind, hidden: false }))

const ID = /^[a-z][a-z0-9-]{0,59}$/

/** Validates a saved layout. Anything malformed falls back to the default, never a broken page. */
export function parseLayout(raw: unknown): SectionInstance[] {
  try {
    const list = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(list) || list.length === 0 || list.length > 30) return DEFAULT_LAYOUT
    const seen = new Set<string>()
    const out: SectionInstance[] = []
    for (const item of list) {
      if (!item || typeof item.id !== 'string' || !ID.test(item.id) || seen.has(item.id) || !(item.kind in SECTION_DEFS)) return DEFAULT_LAYOUT
      if (out.some(existing => existing.kind === item.kind)) return DEFAULT_LAYOUT
      seen.add(item.id)
      out.push({ id: SECTION_DEFS[item.kind as SectionKind].anchor, kind: item.kind, hidden: item.hidden === true })
    }
    // Sections that cannot be removed are always present and visible.
    for (const def of Object.values(SECTION_DEFS)) if (!def.removable) {
      const found = out.find(section => section.kind === def.kind)
      if (!found) return DEFAULT_LAYOUT
      found.hidden = false
    }
    return out
  } catch { return DEFAULT_LAYOUT }
}

export function buildManifest() {
  return {
    modelVersion: MODEL_VERSION, site: SITE_KEY,
    sections: Object.values(SECTION_DEFS),
    defaultLayout: DEFAULT_LAYOUT,
    layoutRules: { reorder: true, hide: 'removable sections only', remove: 'removable sections only', add: 'custom modules via the section registry (app/anyos-sections)' },
    styleSettings: ['--lucy-sage', '--lucy-gold', '--lucy-charcoal', '--lucy-cream', '--section-space', '--heading-size', '--hero-image-height', '--button-radius', '--card-radius', '--content-width'],
  }
}

/** Default value of every field, keyed by field ID. Placeholder-only fields seed empty. */
export function buildSeed(): Record<string, string> {
  const seed: Record<string, string> = {}
  for (const def of Object.values(SECTION_DEFS)) for (const field of def.fields) seed[field.id] = field.default
  return seed
}
