'use client'

import Link from 'next/link'
import { Edit3, ExternalLink, LogOut } from 'lucide-react'
import { useCms } from './CmsProvider'
import { RevisionPanel } from './RevisionPanel'

export function AdminBar() {
  const cms = useCms()

  if (!cms.isAdmin) return null

  const statusLabel = cms.storageMode === 'loading' ? 'Checking access…' : cms.storageWritable ? 'Ready to edit' : 'Read-only mode'

  return (
    <>
      <div className="pointer-events-none fixed right-3 top-3 z-[9999] flex w-[calc(100%-1.5rem)] justify-end sm:right-6 sm:top-20 sm:w-auto">
        <div className="pointer-events-auto flex w-full max-w-[22rem] flex-col gap-2 rounded-[1.5rem] border border-white/20 bg-lucy-charcoal/95 p-2 text-white shadow-2xl shadow-black/35 ring-1 ring-lucy-sage/25 backdrop-blur-md sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:rounded-full">
          <div className="px-3 py-1 sm:max-w-[10rem]">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-white/70">Lucy editor</p>
            <p className="truncate text-[0.72rem] font-semibold text-white/85">{statusLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => cms.setEditMode(!cms.editMode)} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-black shadow-lg transition sm:flex-none ${cms.editMode ? 'bg-lucy-sage text-white shadow-lucy-sage/30' : 'bg-white text-lucy-charcoal shadow-black/15 hover:bg-lucy-cream'}`}>
              <Edit3 size={14} /> {cms.editMode ? 'Editing on' : 'Edit site'}
            </button>
            <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 text-xs font-bold text-white hover:bg-white/15"><ExternalLink size={14} /> <span className="hidden sm:inline">Site</span></Link>
            <button onClick={cms.logout} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 text-xs font-bold text-white hover:bg-white/15"><LogOut size={14} /> <span className="hidden sm:inline">Logout</span></button>
          </div>
        </div>
      </div>
      <RevisionPanel />
    </>
  )
}
