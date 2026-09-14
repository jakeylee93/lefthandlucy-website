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

Verified: Next 14 production build; synthetic actual loader/renderer browser suite
at 375/390/1440px, eight desktop columns, one phone card, all four legacy languages,
reduced motion, malformed-data retention and intercepted enquiry success/idempotency.
These tests are not a real enquiry-delivery test or physical iPhone acceptance.
Release must coordinate the platform editor and this consumer; don't claim every
bespoke original section has been rewritten as schema data.

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
