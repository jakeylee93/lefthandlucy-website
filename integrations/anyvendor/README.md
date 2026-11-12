# Left Hand Lucy — AnyVendor packet (`anyvendor.site/v1`, bridge `anyvendor.bridge/v1`)

Slug `left-hand-lucy`, kind `bespoke`. Written against jakeylee93/anyvendor@1f2379e
(`docs/backend/SITE-CONTENT-CONTRACT-v1.md`, `HANDOFF-TL-SITE-BRIDGE.md`, `adapters/anyvendor-bridge.js`).

| File | What it is |
| --- | --- |
| `manifest.json` | Every editable section and field. Load with `set_site_manifest`. |
| `content.json` | Full seed: what the site shows today, with Lucy's 15 saved anyOS values applied. Seed as draft 1 and publish. |
| `field-map.json` | Each field path → the marker on the page and the anyOS key it replaces. |

These three files are generated from `app/content/anyvendor-v1.ts` and are also served live at
`/site-manifest` (`anyvendor.manifest`, `.content`, `.elements`). Regenerate: `scripts/export-anyvendor-packet.sh`.

- **Chapters:** `page.chapters` is a list of `{ chapter: select, visible: boolean }` over
  `services`, `about`, `testimonials`, `contact`. The introduction always opens the page. `contact`
  is always shown (bridge `keepVisible`). A chapter left out of the list is removed; add it back from the list.
- **Lists:** `services.ps_includes` / `el_includes` / `ee_includes` (rows `{ text }`, max 8) and
  `testimonials.items` (rows `{ text, name, role, service }`, max 6). A quote shows only with both
  words and a name. All four quote texts saved in anyOS are seeded: one has a saved name and shows; three have no saved
  name, so they are kept as rows with a blank name and stay off the page until a name is added.
  Template placeholder names are never seeded.
- **Site side:** `/preview?token=<uuid>[&av_edit=1]` (fail-closed 404), server-side reader
  `app/content/anyvendor-server.ts`, bridge `public/anyvendor-bridge.js` (unchanged copy),
  capabilities `{ text: true, image: true, chapters: true }` with `onChapters` applied in React.
- **Public page:** still anyOS. It reads AnyVendor's published content only when the deployment
  sets `ANYVENDOR_PUBLIC_CONTENT=1`; unknown or unpublished keeps the built-in content and anyOS.
