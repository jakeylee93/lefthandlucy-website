# Lucy website refresh — 10 September 2026

## Modular renderer candidate — 14 September 2026

Isolated branch `codex/lucy-modular-completion-20260914`, baseline `fcef0d9`.
Added canonical anyOS section renderer revision 2 for `__sections_v1`. Existing
copy, photos, translations, original section layout and CMS overrides are unchanged;
legacy `__sections` content continues to render by its original language filter.
The manifest advertises registry 1/revision 2 only because this renderer is bundled.

`app/anyos-sections` is a mechanical snapshot from platform source, not a hand-edited
fork. Update and verify using platform `scripts/export-website-sections.mjs --output
<this-repo>/app/anyos-sections [--check]`; source hashes are committed beside it.
New section colours/body font inherit the site; headings use `--font-heading`.
Malformed CMS replacements keep the last valid modular content. No new secrets,
paid services, live enquiry, hosting changes or deployment performed.

Initial verification: Next 14 production build; synthetic actual loader/renderer browser suite
at 375/390/1440px, eight desktop columns, one phone card, all four legacy languages,
reduced motion, malformed-data retention and intercepted enquiry success/idempotency.
These tests are not a real enquiry-delivery test or physical iPhone acceptance.
Release must coordinate the platform editor and this consumer; don't claim every
bespoke original section has been rewritten as schema data.

### Release dependency preflight

Root found known advisories in the old Next14 dependency tree; this candidate
updates to the patched15.5.25 maintenance line, React/DOM/types19.3.0 and matching
ESLint config. Next's bundled PostCSS is explicitly overridden to8.5.28. Fresh
lock resolution also updates vulnerable compatible transitive dependencies; no
force/legacy-peer install was used. The normal install originally retained an
invalid old nested PostCSS, so the isolated install/lock were backed up outside
the repo and regenerated. `npm audit` now reports zero vulnerabilities and
`npm ls` confirms one valid React19.3.0 graph and PostCSS8.5.28. This is a current
dependency audit result, not a blanket security certification.

Official async-request codemod dry run inspected8files: all unmodified. The only
TS configuration change is Next's required ES2017 target. Fresh Next15 production
build passes6pages; lint passes with existing font/img warnings. Root's local
built-app test covers375/390/1440px, all four languages, navigation/testimonials,
zero overflow/runtime errors and no external mutations. The modular renderer
fixture and checksum check also pass with React19. All external requests were
intercepted; no live enquiry, CMS publication or provider call was made.

Sources: [Next15 upgrade guidance](https://nextjs.org/docs/app/guides/upgrading/version-15),
[patched image-optimization advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4).
Root owns reviewed PR, merge and Ready deployment; none claimed yet.

Codex lane: `codex/lucy-frida-refresh-20260910`, based on published `origin/main`.
Preserve existing words, translations, photos and CMS keys/overrides. Do not
touch the dirty older checkout. Scope: responsive visual refresh, navigation,
accessible contact form backed by anyOS enquiry capture, WhatsApp +34697903144,
and bounded CMS integration for Frida. The corresponding platform branch is
`codex/lucy-frida-platform-20260910`. No unrelated platform release.

Motion: brief opacity/transform only, reduced-motion fallback, no auto-advancing
content or frame-by-frame React progress state. Test all four languages, every
section/link, narrow mobile and desktop; a real labelled enquiry must be saved
before claiming the form works. No fake sent state or fake booking.
