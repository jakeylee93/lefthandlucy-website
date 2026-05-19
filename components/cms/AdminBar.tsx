'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Edit3, ExternalLink, LogOut, X } from 'lucide-react'
import { useCms } from './CmsProvider'
import { RevisionPanel } from './RevisionPanel'

export function AdminBar() {
  const cms = useCms()
  const [open, setOpen] = useState(false)

  if (!cms.isAdmin) return null

  const statusLabel = cms.storageMode === 'loading' ? 'Checking access…' : cms.storageWritable ? 'Ready to edit' : 'Read-only mode'

  return (
    <>
      <div className="pointer-events-none fixed right-3 z-[9999] flex justify-end sm:right-6" style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="pointer-events-auto w-[min(20rem,calc(100vw-1.5rem))] text-white sm:w-auto">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="ml-auto flex min-h-[44px] max-w-full items-center gap-3 rounded-full border border-white/20 bg-lucy-charcoal/95 px-3 py-2 shadow-2xl shadow-black/35 ring-1 ring-lucy-sage/25 backdrop-blur-md transition hover:bg-lucy-charcoal"
            aria-expanded={open}
            aria-label="Open Lucy editor controls"
          >
            <span className={`grid size-8 place-items-center rounded-full ${cms.editMode ? 'bg-lucy-sage text-white' : 'bg-white text-lucy-charcoal'}`}><Edit3 size={15} /></span>
            <span className="min-w-0 text-left">
              <span className="block text-[0.62rem] font-black uppercase tracking-[0.18em] text-white/70">Lucy editor</span>
              <span className="block truncate text-[0.72rem] font-semibold text-white/90">{cms.editMode ? 'Tap text to edit' : statusLabel}</span>
            </span>
            {open ? <X size={16} className="shrink-0 text-white/75" /> : <ChevronDown size={16} className="shrink-0 text-white/75" />}
          </button>

          <div className={`${open ? 'mt-2 opacity-100' : 'pointer-events-none mt-0 max-h-0 opacity-0'} overflow-hidden rounded-[1.35rem] border border-white/15 bg-lucy-charcoal/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-md transition-all sm:absolute sm:right-0 sm:min-w-[19rem]`}>
            <div className="mb-2 rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/80">
              {cms.storageWritable ? 'Ready to edit Lucy’s site.' : 'Read-only mode — saves are currently unavailable.'}
            </div>
            <div className="grid grid-cols-3 gap-2">
            <button onClick={() => cms.setEditMode(!cms.editMode)} className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-3 py-3 text-xs font-black shadow-lg transition ${cms.editMode ? 'bg-lucy-sage text-white shadow-lucy-sage/30' : 'bg-white text-lucy-charcoal shadow-black/15 hover:bg-lucy-cream'}`}>
              <Edit3 size={14} /> {cms.editMode ? 'Editing on' : 'Edit site'}
            </button>
            <Link href="/" className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-white/10 px-3 py-3 text-xs font-bold text-white hover:bg-white/15"><ExternalLink size={14} /> Site</Link>
            <button onClick={cms.logout} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-white/10 px-3 py-3 text-xs font-bold text-white hover:bg-white/15"><LogOut size={14} /> Logout</button>
            </div>
          </div>
        </div>
      </div>
      <RevisionPanel />
    </>
  )
}
