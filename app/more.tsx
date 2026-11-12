'use client'
import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * A named "more" control: keeps a chapter to one composed screen on phones
 * while every word stays one tap away (and in the page for editors and search).
 * With desktopOpen the content is simply always shown on wide screens.
 */
export function More({ id, label, less, children, desktopOpen = false, className = '' }: { id: string; label: string; less: string; children: ReactNode; desktopOpen?: boolean; className?: string }) {
  const [open, setOpen] = useState(false)
  return <div className={`more${open ? ' is-open' : ''}${desktopOpen ? ' more-desktop-open' : ''} ${className}`}>
    <button type="button" className="more-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><span>{open ? less : label}</span><ChevronDown size={16} strokeWidth={1.8} /></button>
    <div id={id} className="more-body">{children}</div>
  </div>
}
