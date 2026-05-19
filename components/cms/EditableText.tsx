'use client'

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Eye, Italic, RotateCcw, Sparkles, X } from 'lucide-react'
import { useCms } from './CmsProvider'
import { richTextToPlainText, sanitizeRichText } from '@/lib/cms/rich-text'

type EditableTextProps = {
  cmsKey: string
  fallback?: string
  as?: keyof JSX.IntrinsicElements
  className?: string
  style?: React.CSSProperties
  children?: ReactNode
}

type EditorModalProps = {
  label: string
  initialValue: string
  saving: boolean
  onClose: () => void
  onOpenRevisions: () => void
  onSave: (value: string) => Promise<void>
}

function RichTextEditorModal({ label, initialValue, saving, onClose, onOpenRevisions, onSave }: EditorModalProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [preview, setPreview] = useState(false)
  const [draftHtml, setDraftHtml] = useState('')
  const [error, setError] = useState('')
  const safeInitialValue = useMemo(() => sanitizeRichText(initialValue), [initialValue])

  useEffect(() => {
    setDraftHtml(safeInitialValue)
    if (editorRef.current) editorRef.current.innerHTML = safeInitialValue
  }, [safeInitialValue])

  function syncDraft() {
    setDraftHtml(editorRef.current?.innerHTML || draftHtml)
  }

  function command(name: string) {
    editorRef.current?.focus()
    document.execCommand(name, false)
    syncDraft()
  }

  async function save() {
    setError('')
    const html = sanitizeRichText(editorRef.current?.innerHTML || draftHtml)
    try {
      await onSave(html)
    } catch (saveError) {
      setError((saveError as Error).message || 'Couldn’t save this edit.')
    }
  }

  const plainPreview = richTextToPlainText(draftHtml || safeInitialValue)

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-lucy-charcoal/65 px-3 pb-0 pt-8 backdrop-blur-sm sm:items-center sm:px-6 sm:py-6" role="dialog" aria-modal="true" aria-label={`Edit ${label}`}>
      <div className="flex max-h-[calc(100svh-1.25rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-[1.75rem] border border-white/15 bg-white text-lucy-charcoal shadow-2xl shadow-black/35 sm:max-h-[88svh] sm:rounded-[1.75rem]">
        <div className="flex items-start justify-between gap-4 border-b border-black/5 bg-lucy-cream px-5 py-4 sm:px-6">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-lucy-sage">Editing Lucy’s website</p>
            <h2 className="mt-1 text-xl font-semibold sm:text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>{label}</h2>
            <p className="mt-1 text-xs text-lucy-grey">Make a small copy edit, then tap Save changes.</p>
          </div>
          <button onClick={onClose} className="grid min-h-[44px] min-w-[44px] place-items-center rounded-full bg-white text-lucy-charcoal shadow-sm transition hover:bg-lucy-charcoal hover:text-white" aria-label="Close editor">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="rounded-2xl border border-black/5 bg-lucy-cream p-2">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => command('bold')} className="min-h-[44px] rounded-xl bg-white px-4 py-2 text-sm font-black shadow-sm hover:bg-lucy-sage hover:text-white" aria-label="Bold selected text">Bold</button>
              <button type="button" onClick={() => command('italic')} className="inline-flex min-h-[44px] items-center gap-1 rounded-xl bg-white px-4 py-2 text-sm italic shadow-sm hover:bg-lucy-sage hover:text-white" aria-label="Italic selected text"><Italic size={16} /> Italic</button>
              <button type="button" aria-label="Preview changes" onClick={() => { syncDraft(); setPreview(!preview) }} className={`ml-auto inline-flex min-h-[44px] items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition ${preview ? 'bg-lucy-sage text-white' : 'bg-white hover:bg-lucy-sage hover:text-white'}`}><Eye size={16} /> Preview</button>
            </div>
          </div>

          {preview ? (
            <div className="min-h-[12rem] rounded-2xl border border-black/10 bg-white p-4 text-base leading-relaxed shadow-inner" dangerouslySetInnerHTML={{ __html: sanitizeRichText(draftHtml || safeInitialValue) }} />
          ) : (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={syncDraft}
              className="min-h-[15rem] rounded-2xl border-2 border-lucy-sage/25 bg-white p-4 text-base leading-relaxed text-lucy-charcoal outline-none shadow-inner focus:border-lucy-sage sm:min-h-[16rem] sm:text-lg"
              aria-label="Website text editor"
            />
          )}

          {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
          <p className="rounded-2xl bg-lucy-cream px-4 py-3 text-xs text-lucy-grey"><Sparkles className="mr-1 inline" size={13} />Tip: V1 is copy-first. Bold or italic are there if needed, but the site keeps its own fonts and design.</p>
          <p className="sr-only">Current plain text preview: {plainPreview}</p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-black/5 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <button onClick={onOpenRevisions} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-lucy-cream px-5 py-3 text-sm font-bold text-lucy-charcoal hover:bg-lucy-charcoal hover:text-white"><RotateCcw size={16} /> Revisions</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="min-h-[44px] flex-1 rounded-full border border-black/10 px-5 py-3 text-sm font-bold text-lucy-grey hover:bg-lucy-cream sm:flex-none">Cancel</button>
            <button disabled={saving} onClick={save} className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-lucy-sage px-6 py-3 text-sm font-black text-white shadow-lg shadow-lucy-sage/25 transition hover:bg-lucy-sage/90 disabled:opacity-60 sm:flex-none"><Check size={16} /> {saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EditableText({ cmsKey, fallback = '', as = 'span', className = '', style, children }: EditableTextProps) {
  const cms = useCms()
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const Component = as as any
  const rawValue = cms.text(cmsKey, fallback || (typeof children === 'string' ? children : ''))
  const value = sanitizeRichText(rawValue)

  async function save(nextValue: string) {
    if (!cms.isAdmin || saving) return
    setSaving(true)
    try {
      await cms.updateText(cmsKey, nextValue)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function openRevisions() {
    setEditing(false)
    cms.openRevisions(cmsKey)
  }

  if (!cms.isAdmin || !cms.editMode) {
    return <Component className={className} style={style} dangerouslySetInnerHTML={{ __html: value }} />
  }

  return (
    <span className="group/cms relative inline-block align-baseline">
      <Component
        className={`${className} cursor-pointer rounded-md outline outline-1 outline-dashed outline-violet-400/45 transition hover:bg-violet-100/25 hover:outline-violet-500 focus:bg-violet-100/30 focus:outline-violet-500 ${saving ? 'opacity-60' : ''}`}
        style={style}
        onClick={(event: React.MouseEvent<HTMLElement>) => {
          if (saving) return
          event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setEditing(true)
        }}
        title="Tap to edit this website text."
        dangerouslySetInnerHTML={{ __html: value }}
      />
      {editing && (
        <RichTextEditorModal
          label={cms.content[cmsKey]?.label || cmsKey}
          initialValue={rawValue}
          saving={saving}
          onClose={() => setEditing(false)}
          onOpenRevisions={openRevisions}
          onSave={save}
        />
      )}
    </span>
  )
}
