import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Home from '../home'
import { editorOrigins, siteDraft } from '../content/anyvendor-server'
import { viewFromV1 } from '../content/anyvendor-v1'

// The AnyVendor draft page: /preview?token=<draft token>[&av_edit=1].
// Fail closed: a missing, malformed or wrong token is a 404; it never falls back
// to published or built-in content. No anyOS script, no analytics, nothing cached.
// (no-store, noindex, no-referrer and frame-ancestors are sent from next.config.js.)
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Draft preview — Left Hand Lucy', robots: { index: false, follow: false }, referrer: 'no-referrer' }

export default async function Preview({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const site = await siteDraft(params.token)
  if (!site) notFound()
  return <Home source="anyvendor" av={viewFromV1(site.content)} draft edit={params.av_edit === '1'} editorOrigins={editorOrigins()} />
}
