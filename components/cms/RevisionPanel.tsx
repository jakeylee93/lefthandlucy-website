'use client'

import { useEffect, useState } from 'react'
import { RotateCcw, X } from 'lucide-react'
import type { CmsRevision } from '@/lib/cms/types'
import { richTextToPlainText } from '@/lib/cms/rich-text'
import { useCms } from './CmsProvider'

function revisionLabel(action: string, index: number) {
  if (index === 0) return action === 'restore' ? 'Latest restore' : 'Latest save'
  return action === 'restore' ? 'Restored version' : 'Previous version'
}

export function RevisionPanel() {
  const cms = useCms()
  const [revisions, setRevisions] = useState<CmsRevision[]>([])
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)

  useEffect(() => {
    if (!cms.revisionKey) return
    setLoading(true)
    fetch(`/api/cms/revisions?key=${encodeURIComponent(cms.revisionKey)}`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload) => setRevisions(payload.revisions || []))
      .finally(() => setLoading(false))
  }, [cms.revisionKey])

  if (!cms.revisionKey) return null

  async function restore(revisionId: string) {
    if (!cms.revisionKey || !window.confirm('Restore this version? This will make this text live again and save a new revision.')) return
    setRestoring(revisionId)
    const response = await fetch('/api/cms/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: cms.revisionKey, revisionId }),
    })
    const payload = await response.json().catch(() => ({}))
    setRestoring(null)
    if (!response.ok) {
      window.alert(payload.error || 'Could not restore revision')
      return
    }
    await cms.refreshContent()
    cms.closeRevisions()
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-end bg-black/45 px-3 pt-8 backdrop-blur-sm sm:items-center sm:justify-end sm:p-6" onClick={cms.closeRevisions}>
      <div className="flex max-h-[calc(100svh-1.25rem)] w-full flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-2xl sm:h-full sm:max-w-lg sm:rounded-[2rem]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-black/5 bg-lucy-cream p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-lucy-sage">Revisions</p>
            <h2 className="mt-1 text-xl font-semibold text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>{cms.content[cms.revisionKey]?.label || cms.revisionKey}</h2>
            <p className="mt-1 text-xs text-lucy-grey">Restore an older save if something goes wrong.</p>
          </div>
          <button onClick={cms.closeRevisions} className="grid min-h-[44px] min-w-[44px] place-items-center rounded-full bg-white text-lucy-charcoal shadow-sm hover:bg-lucy-charcoal hover:text-white" aria-label="Close revisions"><X size={18} /></button>
        </div>
        <div className="flex-1 space-y-3 overflow-auto p-5">
          {loading && <p className="text-sm text-lucy-grey">Loading revisions…</p>}
          {!loading && revisions.length === 0 && <p className="rounded-2xl bg-lucy-cream p-4 text-sm text-lucy-grey">No revisions yet. Save an edit first.</p>}
          {revisions.map((revision, index) => (
            <div key={revision.id} className="rounded-2xl border border-black/5 bg-lucy-cream p-4">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-lucy-sage">{revisionLabel(revision.action, index)}</p>
                  <p className="mt-1 text-xs font-semibold text-lucy-grey">{new Date(revision.createdAt).toLocaleString()}</p>
                </div>
                <button disabled={restoring === revision.id} onClick={() => restore(revision.id)} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-lucy-sage px-4 py-2 text-xs font-black text-white disabled:opacity-60"><RotateCcw size={14} /> {restoring === revision.id ? 'Restoring…' : 'Restore this version'}</button>
              </div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-lucy-grey">Before</p>
              <p className="mb-3 max-h-32 overflow-auto rounded-xl bg-white p-3 text-sm leading-relaxed text-lucy-charcoal">{richTextToPlainText(revision.oldValue)}</p>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-lucy-grey">After</p>
              <p className="max-h-32 overflow-auto rounded-xl bg-white p-3 text-sm leading-relaxed text-lucy-charcoal">{richTextToPlainText(revision.newValue)}</p>
            </div>
          ))}
        </div>
        <button onClick={cms.closeRevisions} className="min-h-[52px] border-t border-black/5 bg-white p-4 text-sm font-black text-lucy-charcoal" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>Close revisions</button>
      </div>
    </div>
  )
}
