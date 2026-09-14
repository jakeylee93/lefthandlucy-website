/** Trusted declarative website sections. Shared by manual editors and agent tools.
 * No HTML, CSS, scripts, arbitrary form actions or generated components. */
export const SECTION_REGISTRY = {
  hero: { label: "Hero", items: 0 },
  "text-image": { label: "Text & image", items: 0 },
  gallery: { label: "Gallery", items: 24 },
  carousel: { label: "Carousel", items: 24 },
  ticker: { label: "Ticker", items: 24 },
  testimonials: { label: "Testimonials", items: 12 },
  form: { label: "Contact form", items: 0 },
  products: { label: "Products", items: 24 },
} as const;
export type SectionKind = keyof typeof SECTION_REGISTRY;
export const SECTION_RENDERER_REVISION = 2;
export const SECTION_COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export interface SectionItem { id: string; title: string; body: string; image: string; imageAlt: string; href: string }
export interface WebsiteSection {
  version: 1; id: string; kind: SectionKind; title: string; body: string;
  image: string; imageAlt: string; items: SectionItem[]; cta: string; href: string;
  hidden: boolean;
  settings: { columns: typeof SECTION_COLUMNS[number]; transition: "none" | "fade" | "slide"; intervalSeconds: number };
}
const ID = /^[a-z][a-z0-9-]{0,59}$/;
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Use a section object.");
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number): string {
  if (value === undefined) return "";
  if (typeof value !== "string" || value.length > max || /[<>\u0000-\u0008]/.test(value)) throw new Error(`Use plain text up to ${max} characters.`);
  return value;
}
function id(value: unknown): string {
  if (typeof value !== "string" || !ID.test(value)) throw new Error("Each section and item needs a stable id using lowercase letters, digits and hyphens.");
  return value;
}
function href(value: unknown, image = false): string {
  const candidate = text(value, 2000).trim();
  if (!candidate) return "";
  if (!image && /^(#[a-z][\w-]*|\/(?!\/)[^\s\\]*|mailto:[^\s<>]+|tel:[+\d -]+)$/i.test(candidate)) return candidate;
  try { const url = new URL(candidate); if (url.protocol === "https:" && !url.username && !url.password) return url.href; } catch { /* bounded validation error below */ }
  throw new Error(image ? "Images must use public HTTPS URLs." : "Use an HTTPS, local, email, telephone or anchor link.");
}
function unique(values: string[]) { if (new Set(values).size !== values.length) throw new Error("Section and item ids must be unique."); }

export function validateWebsiteSections(value: unknown): WebsiteSection[] {
  const sections = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(sections) || sections.length > 20) throw new Error("Use up to 20 sections.");
  const result = sections.map((input): WebsiteSection => {
    const row = record(input);
    if (row.version !== 1 || typeof row.kind !== "string" || !Object.hasOwn(SECTION_REGISTRY, row.kind)) throw new Error("Unsupported section version or kind.");
    const kind = row.kind as SectionKind;
    const settings = row.settings === undefined ? {} : record(row.settings);
    const columns = settings.columns ?? 3;
    const transition = settings.transition ?? "none";
    const intervalSeconds = settings.intervalSeconds ?? 6;
    if (!(SECTION_COLUMNS as readonly unknown[]).includes(columns) || !["none", "fade", "slide"].includes(transition as string)
      || typeof intervalSeconds !== "number" || !Number.isInteger(intervalSeconds) || intervalSeconds < 3 || intervalSeconds > 30) throw new Error("Choose 1–8 columns, a supported transition and a 3–30 second interval.");
    if (row.hidden !== undefined && typeof row.hidden !== "boolean") throw new Error("Hidden must be true or false.");
    const rawItems = row.items ?? [];
    if (!Array.isArray(rawItems) || rawItems.length > SECTION_REGISTRY[kind].items) throw new Error(`This section supports up to ${SECTION_REGISTRY[kind].items} items.`);
    const items = rawItems.map(input => {
      const item = record(input);
      return { id: id(item.id), title: text(item.title, 200), body: text(item.body, 3000), image: href(item.image, true), imageAlt: text(item.imageAlt, 240), href: href(item.href) };
    });
    unique(items.map(item => item.id));
    const title = text(row.title, 200);
    if (!title.trim()) throw new Error("Give each section a title.");
    return { version: 1, id: id(row.id), kind, title, body: text(row.body, 10000), image: href(row.image, true), imageAlt: text(row.imageAlt, 240),
      items, cta: text(row.cta, 80), href: href(row.href), hidden: row.hidden === true,
      settings: { columns: columns as WebsiteSection["settings"]["columns"], transition: transition as WebsiteSection["settings"]["transition"], intervalSeconds } };
  });
  unique(result.map(section => section.id));
  if (JSON.stringify(result).length > 120000) throw new Error("The section document is too large.");
  return result;
}

export function newWebsiteSection(kind: SectionKind, sectionId: string): WebsiteSection {
  return validateWebsiteSections([{ version: 1, id: sectionId, kind, title: SECTION_REGISTRY[kind].label, settings: { columns: kind === "carousel" ? 1 : 3 } }])[0];
}

/** Registry data remains v1; advanced presentation needs a renderer that actually implements it. */
export function sectionRendererRequirement(sections: WebsiteSection[]): 1 | 2 {
  return sections.some(section => section.settings.columns > 4
    || section.kind === "carousel" && section.settings.columns > 1
    || section.kind === "ticker" && section.settings.transition !== "none") ? 2 : 1;
}

export type SectionOperation =
  | { type: "add"; section: WebsiteSection }
  | { type: "replace"; id: string; section: WebsiteSection }
  | { type: "move"; id: string; index: number }
  | { type: "duplicate"; id: string; newId: string }
  | { type: "hide"; id: string; hidden: boolean }
  | { type: "remove"; id: string };

export function applySectionOperation(input: WebsiteSection[], operation: SectionOperation): WebsiteSection[] {
  const sections = validateWebsiteSections(input);
  if (operation.type === "add") return validateWebsiteSections([...sections, operation.section]);
  const index = sections.findIndex(section => section.id === operation.id);
  if (index < 0) throw new Error("That section no longer exists. Reload the page.");
  const current = sections[index];
  switch (operation.type) {
    case "replace":
      if (operation.section.id !== current.id) throw new Error("A section's stable id cannot change.");
      sections[index] = operation.section; break;
    case "move":
      if (!Number.isInteger(operation.index) || operation.index < 0 || operation.index >= sections.length) throw new Error("Invalid section position.");
      sections.splice(index, 1); sections.splice(operation.index, 0, current); break;
    case "duplicate": sections.splice(index + 1, 0, { ...current, id: operation.newId, title: `${current.title.slice(0, 190)} (copy)` }); break;
    case "hide": sections[index] = { ...current, hidden: operation.hidden }; break;
    case "remove": sections.splice(index, 1); break;
  }
  return validateWebsiteSections(sections);
}
