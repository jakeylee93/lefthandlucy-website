'use client'

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Eye, Italic, RotateCcw, Sparkles, Underline, X } from 'lucide-react'
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

type EditableStyle = {
  label: string
  value: string
}

const FONT_OPTIONS: EditableStyle[] = [
  { label: 'Site font', value: 'Inter, system-ui, sans-serif' },
  { label: 'Lucy heading', value: 'var(--font-heading)' },
  { label: 'Serif', value: 'Georgia, serif' },
]

const COLOUR_OPTIONS: EditableStyle[] = [
  { label: 'Charcoal', value: '#2f2b26' },
  { label: 'Sage', value: '#75856b' },
  { label: 'Warm gold', value: '#b58b4a' },
  { label: 'Soft purple', value: '#7c6aa6' },
]

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
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

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

  function applySpanStyle(style: Partial<CSSStyleDeclaration>) {
    editorRef.current?.focus()
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return
    const range = selection.getRangeAt(0)
    if (!editorRef.current?.contains(range.commonAncestorContainer)) return
    const span = document.createElement('span')
    if (style.fontFamily) span.style.fontFamily = style.fontFamily
    if (style.color) span.style.color = style.color
    try {
      range.surroundContents(span)
    } catch {
      span.appendChild(range.extractContents())
      range.insertNode(span)
    }
    selection.removeAllRanges()
    const nextRange = document.createRange()
    nextRange.selectNodeContents(span)
    selection.addRange(nextRange)
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

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-lucy-charcoal/55 px-3 pb-3 pt-6 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Edit ${label}`}>
      <div className="flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-[1.65rem] border border-white/20 bg-white text-lucy-charcoal shadow-2xl shadow-black/35 sm:max-h-[min(42rem,88dvh)] sm:max-w-2xl sm:rounded-[2rem]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="shrink-0 border-b border-black/5 bg-lucy-cream px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-lucy-sage">Editing Lucy’s website</p>
              <h2 className="mt-1 truncate text-lg font-semibold sm:text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>{label}</h2>
              <p className="mt-1 text-xs text-lucy-grey">A neat editor for text, colour and font. Save updates the live site.</p>
            </div>
            <button onClick={onClose} className="grid min-h-[44px] min-w-[44px] place-items-center rounded-full bg-white text-lucy-charcoal shadow-sm transition hover:bg-lucy-charcoal hover:text-white" aria-label="Close editor">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <div className="shrink-0 rounded-2xl border border-black/5 bg-lucy-cream p-2">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              <button type="button" onClick={() => command('bold')} className="min-h-[42px] rounded-xl bg-white px-3 py-2 text-sm font-black shadow-sm hover:bg-lucy-sage hover:text-white" aria-label="Bold selected text">Bold</button>
              <button type="button" onClick={() => command('italic')} className="inline-flex min-h-[42px] items-center justify-center gap-1 rounded-xl bg-white px-3 py-2 text-sm italic shadow-sm hover:bg-lucy-sage hover:text-white" aria-label="Italic selected text"><Italic size={15} /> Italic</button>
              <button type="button" onClick={() => command('underline')} className="inline-flex min-h-[42px] items-center justify-center gap-1 rounded-xl bg-white px-3 py-2 text-sm font-bold underline shadow-sm hover:bg-lucy-sage hover:text-white" aria-label="Underline selected text"><Underline size={15} /> Line</button>
              <select aria-label="Font style" onChange={(event) => applySpanStyle({ fontFamily: event.target.value })} defaultValue="" className="col-span-3 min-h-[42px] rounded-xl border-0 bg-white px-3 py-2 text-sm font-bold shadow-sm outline-none ring-0 focus:ring-2 focus:ring-lucy-sage/40 sm:col-span-1">
                <option value="" disabled>Font</option>
                {FONT_OPTIONS.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}
              </select>
              <select aria-label="Text colour" onChange={(event) => applySpanStyle({ color: event.target.value })} defaultValue="" className="col-span-2 min-h-[42px] rounded-xl border-0 bg-white px-3 py-2 text-sm font-bold shadow-sm outline-none ring-0 focus:ring-2 focus:ring-lucy-sage/40 sm:col-span-1">
                <option value="" disabled>Colour</option>
                {COLOUR_OPTIONS.map((colour) => <option key={colour.value} value={colour.value}>{colour.label}</option>)}
              </select>
              <button type="button" aria-label="Preview changes" onClick={() => { syncDraft(); setPreview(!preview) }} className={`inline-flex min-h-[42px] items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-bold shadow-sm transition ${preview ? 'bg-lucy-sage text-white' : 'bg-white hover:bg-lucy-sage hover:text-white'}`}><Eye size={15} /> Preview</button>
            </div>
          </div>

          <div className="min-h-0 flex-1">
            {preview ? (
              <div className="h-full min-h-[8rem] overflow-auto rounded-2xl border border-black/10 bg-white p-4 text-base leading-relaxed shadow-inner sm:min-h-[11rem]" dangerouslySetInnerHTML={{ __html: sanitizeRichText(draftHtml || safeInitialValue) }} />
            ) : (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncDraft}
                className="h-full min-h-[8rem] overflow-auto rounded-2xl border-2 border-lucy-sage/25 bg-white p-4 text-base leading-relaxed text-lucy-charcoal outline-none shadow-inner focus:border-lucy-sage sm:min-h-[16rem] sm:text-lg"
                aria-label="Website text editor"
              />
            )}
          </div>

          {error && <p className="shrink-0 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
          <p className="hidden shrink-0 rounded-2xl bg-lucy-cream px-4 py-3 text-xs text-lucy-grey sm:block"><Sparkles className="mr-1 inline" size={13} />Select words first, then choose font or colour. Keep it simple — this is for tidy text changes, not page building.</p>
          <p className="sr-only">Current plain text preview: {plainPreview}</p>
        </div>

        <div className="shrink-0 border-t border-black/5 bg-white px-4 py-3 sm:px-6 sm:py-4" style={{ paddingBottom: 'max(0.85rem, env(safe-area-inset-bottom))' }}>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-between">
            <button onClick={onOpenRevisions} className="col-span-2 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-lucy-cream px-5 py-3 text-sm font-bold text-lucy-charcoal hover:bg-lucy-charcoal hover:text-white sm:col-span-1"><RotateCcw size={16} /> Versions</button>
            <div className="col-span-2 grid grid-cols-2 gap-2 sm:flex sm:gap-2">
              <button onClick={onClose} className="min-h-[44px] rounded-full border border-black/10 px-5 py-3 text-sm font-bold text-lucy-grey hover:bg-lucy-cream">Cancel</button>
              <button disabled={saving} onClick={save} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-lucy-sage px-5 py-3 text-sm font-black text-white shadow-lg shadow-lucy-sage/25 transition hover:bg-lucy-sage/90 disabled:opacity-60"><Check size={16} /> {saving ? 'Saving…' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
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
