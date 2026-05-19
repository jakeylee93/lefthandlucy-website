'use client'

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Eye, Italic, RotateCcw, Type, Underline, X } from 'lucide-react'
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

const FONT_OPTIONS = [
  { label: 'Site default', value: '' },
  { label: 'Elegant heading', value: 'var(--font-heading)' },
  { label: 'Clean body', value: 'Inter, system-ui, sans-serif' },
  { label: 'Classic serif', value: 'Georgia, serif' },
  { label: 'Simple sans', value: 'Arial, sans-serif' },
]

function selectEditorContents(editor: HTMLDivElement) {
  const range = document.createRange()
  range.selectNodeContents(editor)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

function applyFontToSelection(fontFamily: string, editor: HTMLDivElement | null) {
  if (!editor) return
  editor.focus()
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) {
    selectEditorContents(editor)
  }
  if (!fontFamily) {
    document.execCommand('removeFormat')
    return
  }
  const range = window.getSelection()?.getRangeAt(0)
  if (!range) return
  const span = document.createElement('span')
  span.style.fontFamily = fontFamily
  try {
    range.surroundContents(span)
  } catch {
    const fragment = range.extractContents()
    span.appendChild(fragment)
    range.insertNode(span)
  }
}

function RichTextEditorModal({ label, initialValue, saving, onClose, onOpenRevisions, onSave }: EditorModalProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [preview, setPreview] = useState(false)
  const [font, setFont] = useState('')
  const [draftHtml, setDraftHtml] = useState('')
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
    const html = sanitizeRichText(editorRef.current?.innerHTML || draftHtml)
    await onSave(html)
  }

  const plainPreview = richTextToPlainText(draftHtml || safeInitialValue)

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-lucy-charcoal/55 px-3 py-4 backdrop-blur-sm sm:items-center sm:px-6" role="dialog" aria-modal="true" aria-label={`Edit ${label}`}>
      <div className="max-h-[92svh] w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-white/15 bg-white text-lucy-charcoal shadow-2xl shadow-black/35">
        <div className="flex items-start justify-between gap-4 border-b border-black/5 bg-lucy-cream px-5 py-4 sm:px-6">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-lucy-sage">Editing Lucy’s website</p>
            <h2 className="mt-1 text-xl font-semibold sm:text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>{label}</h2>
            <p className="mt-1 text-xs text-lucy-grey">Use formatting carefully — it will save straight onto the live site.</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-white p-3 text-lucy-charcoal shadow-sm transition hover:bg-lucy-charcoal hover:text-white" aria-label="Close editor">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-black/5 bg-lucy-cream p-2">
            <button type="button" onClick={() => command('bold')} className="rounded-xl bg-white px-3 py-2 text-sm font-black shadow-sm hover:bg-lucy-sage hover:text-white" aria-label="Bold selected text">B</button>
            <button type="button" onClick={() => command('italic')} className="rounded-xl bg-white px-3 py-2 text-sm italic shadow-sm hover:bg-lucy-sage hover:text-white" aria-label="Italic selected text"><Italic size={16} /></button>
            <button type="button" onClick={() => command('underline')} className="rounded-xl bg-white px-3 py-2 text-sm shadow-sm hover:bg-lucy-sage hover:text-white" aria-label="Underline selected text"><Underline size={16} /></button>
            <label className="flex min-w-[12rem] flex-1 items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-lucy-grey shadow-sm">
              <Type size={15} /> Font
              <select
                value={font}
                onChange={(event) => {
                  setFont(event.target.value)
                  applyFontToSelection(event.target.value, editorRef.current)
                  syncDraft()
                }}
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-lucy-charcoal outline-none"
              >
                {FONT_OPTIONS.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <button type="button" aria-label="Preview changes" onClick={() => { syncDraft(); setPreview(!preview) }} className={`rounded-xl px-3 py-2 text-sm font-bold shadow-sm transition ${preview ? 'bg-lucy-sage text-white' : 'bg-white hover:bg-lucy-sage hover:text-white'}`}><Eye size={16} /></button>
          </div>

          {preview ? (
            <div className="min-h-[12rem] rounded-2xl border border-black/10 bg-white p-4 text-base leading-relaxed shadow-inner" dangerouslySetInnerHTML={{ __html: sanitizeRichText(draftHtml || safeInitialValue) }} />
          ) : (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={syncDraft}
              className="min-h-[14rem] rounded-2xl border-2 border-lucy-sage/25 bg-white p-4 text-base leading-relaxed text-lucy-charcoal outline-none shadow-inner focus:border-lucy-sage sm:text-lg"
              aria-label="Website text editor"
            />
          )}

          <p className="rounded-2xl bg-lucy-cream px-4 py-3 text-xs text-lucy-grey">Tip: highlight words first, then tap Bold, Italic, Underline, or choose a font. Keep fonts simple so the page stays polished.</p>
          <p className="sr-only">Current plain text preview: {plainPreview}</p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-black/5 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button onClick={onOpenRevisions} className="inline-flex items-center justify-center gap-2 rounded-full bg-lucy-cream px-5 py-3 text-sm font-bold text-lucy-charcoal hover:bg-lucy-charcoal hover:text-white"><RotateCcw size={16} /> Revisions</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-full border border-black/10 px-5 py-3 text-sm font-bold text-lucy-grey hover:bg-lucy-cream sm:flex-none">Cancel</button>
            <button disabled={saving} onClick={save} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-lucy-sage px-6 py-3 text-sm font-black text-white shadow-lg shadow-lucy-sage/25 transition hover:bg-lucy-sage/90 disabled:opacity-60 sm:flex-none"><Check size={16} /> {saving ? 'Saving…' : 'Save changes'}</button>
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
    } catch (error) {
      window.alert((error as Error).message)
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
        className={`${className} cursor-pointer rounded-md outline outline-1 outline-dashed outline-violet-400/50 transition hover:bg-violet-100/25 hover:outline-violet-500 ${saving ? 'opacity-60' : ''}`}
        style={style}
        onClick={() => !saving && setEditing(true)}
        title="Click to edit this website text."
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
