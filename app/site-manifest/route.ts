import { buildManifest, buildSeed } from '../content/model'
import { buildV1 } from '../content/anyvendor-v1'
import snapshot from '../content/anyos-snapshot-2026-11-11.json'

/**
 * Editor contract for a visual-editor backend (docs/ANYVENDOR-ADAPTER.md).
 *  - anyvendor: anyvendor.site/v1 manifest, full content seed (built-in content
 *    with Lucy's saved anyOS values applied) and the field-to-element map.
 *  - model: the renderer's own typed model (section instances, layout rules).
 *  - anyosSaved: Lucy's saved anyOS values exactly as stored (may contain simple HTML).
 */
export function GET() {
  const saved: Record<string, string> = {}
  for (const [key, raw] of Object.entries(snapshot.content as Record<string, string>)) {
    // Seed values are plain text: decode the few entities anyOS stores and drop markup.
    saved[key] = raw.replace(/<br\s*\/?>/gi, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').trim()
  }
  return Response.json({ anyvendor: buildV1(saved), model: { ...buildManifest(), seed: buildSeed() }, anyosSaved: { capturedAt: '2026-11-11', fields: snapshot.content } })
}
