'use client'

import { useEffect, useState } from 'react'
import type { CmsRevision } from '@/lib/cms/types'
import { useCms } from './CmsProvider'

export function RevisionPanel() {
  const cms = useCms()
  const [revisions, setRevisions] = useState<CmsRevision[]>([])
  const [loading, setLoading] = useState(false)

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
    if (!cms.revisionKey || !window.confirm('Restore this older value? A new restore revision will be created.')) return
    const response = await fetch('/api/cms/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: cms.revisionKey, revisionId }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      window.alert(payload.error || 'Could not restore revision')
      return
    }
    await cms.refreshContent()
    cms.closeRevisions()
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black/40 px-4 py-8 backdrop-blur-sm" onClick={cms.closeRevisions}>
      <div className="ml-auto flex h-full max-w-lg flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-black/5 p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-lucy-sage">Revisions</p>
          <h2 className="mt-1 text-xl font-semibold text-lucy-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>{cms.content[cms.revisionKey]?.label || cms.revisionKey}</h2>
        </div>
        <div className="flex-1 space-y-3 overflow-auto p-5">
          {loading && <p className="text-sm text-lucy-grey">Loading revisions…</p>}
          {!loading && revisions.length === 0 && <p className="rounded-2xl bg-lucy-cream p-4 text-sm text-lucy-grey">No revisions yet. Save an edit first.</p>}
          {revisions.map((revision) => (
            <div key={revision.id} className="rounded-2xl border border-black/5 bg-lucy-cream p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-wide text-lucy-grey">{revision.action} · {new Date(revision.createdAt).toLocaleString()}</p>
                <button onClick={() => restore(revision.id)} className="rounded-full bg-lucy-sage px-3 py-1.5 text-xs font-black text-white">Restore</button>
              </div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-lucy-grey">Old value</p>
              <p className="mb-3 rounded-xl bg-white p-3 text-sm text-lucy-charcoal">{revision.oldValue}</p>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-lucy-grey">New value</p>
              <p className="rounded-xl bg-white p-3 text-sm text-lucy-charcoal">{revision.newValue}</p>
            </div>
          ))}
        </div>
        <button onClick={cms.closeRevisions} className="border-t border-black/5 p-4 text-sm font-black text-lucy-charcoal">Close</button>
      </div>
    </div>
  )
}
