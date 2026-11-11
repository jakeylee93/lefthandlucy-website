# Left Hand Lucy — editor contract for the AnyVendor backend owner

Status: **prepared by the site owner (renderer + adapter). Provisional until the backend's
exact v1.1 schema is shared; no round trip has been tested.** The live site still reads and
saves through anyOS (`edit.js`, site key `left-hand-lucy`). Nothing here moves Lucy's account,
credentials or data, and nobody has been invited.

## What the site serves: `GET /site-manifest`

- `anyvendor` — the `anyvendor.site/v1` baseline:
  - `manifest`: `{ version: 1, name, slug, sections: [{ key, label, fields: [{ key, type, label, max? }] }] }`.
    Keys are lower_snake_case. Types used: `text`, `textarea`, `image` (`{src, alt}`),
    `link` (`{href, label}`), `list` (flat list of text; no nested lists). 5 sections.
  - `content`: the full seed, `{ section_key: { field_key: value } }` — built-in content with
    Lucy's saved anyOS values applied as plain text.
  - `elements`: field-to-element map, `"section.field" → { attr, key }` (or `keys` for a list):
    the `data-anyos` / `data-anyos-img` attribute value(s) the renderer puts on that element.
- `model` — the renderer's typed model: section kinds, default layout (section instances
  `{ id, kind, hidden }`), layout rules, style settings. Source: `app/content/model.ts`.
- `anyosSaved` — Lucy's 15 saved anyOS values exactly as stored on 2026-11-11.

Testimonials: template quotes are placeholders and seed EMPTY. A quote is public only when both
its text and name are saved (today: `t1` only).

## Reading content (baseline; adapter not frozen)

`GET /api/sites/left-hand-lucy/content` → published content, revision, manifest.
`?preview=<site-specific token>` → draft, `no-store`.
Unknown or unpublished site → 404 → **the renderer keeps its built-in content**.

Agreed constraints the renderer will follow once the schema is final:
- read server-side; no write or service-role credential and no deployment-protection bypass
  ever reaches the browser or this repository;
- section instances (add / reorder / hide / remove) follow the v1.1 extension. Today the
  renderer already orders and hides its five built-in sections from a validated layout
  (`parseLayout`): `hero` and `contact` cannot be hidden or removed, one instance per kind,
  an invalid layout falls back to the built-in order.

`app/content/sources.ts` holds the current anyOS adapter and a placeholder for AnyVendor that is
only active when `NEXT_PUBLIC_ANYVENDOR_CONTENT_URL` is set. It will be rewritten as a
server-side reader against the final v1.1 packet.

## What the backend owns

Accounts, permissions, saving, drafts, publish, revision history, rollback, image upload,
site registration and the preview bridge. The site never writes. Testing builds also block
every non-GET call to anyOS.

## Cut-over order (so Lucy is never stranded)

1. Backend imports the seed; anyOS stays the source of truth.
2. A protected preview build reads AnyVendor; save → draft preview → publish → public reload →
   rollback are tested together there.
3. Only then is production switched in one build, with `edit.js` removed in the same change.
