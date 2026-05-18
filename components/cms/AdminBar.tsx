'use client'

import Link from 'next/link'
import { Edit3, LogOut } from 'lucide-react'
import { useCms } from './CmsProvider'
import { RevisionPanel } from './RevisionPanel'

export function AdminBar() {
  const cms = useCms()

  if (!cms.isAdmin) return null

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-[80] flex w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-lucy-charcoal/95 px-4 py-3 text-white shadow-2xl shadow-black/25 backdrop-blur-md">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Left Hand Lucy CMS</p>
          <p className="text-xs text-white/60">Storage: {cms.storageMode}{cms.storageWritable ? '' : ' · read-only until KV env is added'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => cms.setEditMode(!cms.editMode)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition ${cms.editMode ? 'bg-lucy-sage text-white' : 'bg-white text-lucy-charcoal'}`}>
            <Edit3 size={14} /> {cms.editMode ? 'Edit mode on' : 'Edit mode off'}
          </button>
          <Link href="/" className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/15">Site</Link>
          <button onClick={cms.logout} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/15"><LogOut size={14} /> Logout</button>
        </div>
      </div>
      <RevisionPanel />
    </>
  )
}
