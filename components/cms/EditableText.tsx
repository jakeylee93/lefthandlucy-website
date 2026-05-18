'use client'

import { ReactNode, useState } from 'react'
import { useCms } from './CmsProvider'

type EditableTextProps = {
  cmsKey: string
  fallback?: string
  as?: keyof JSX.IntrinsicElements
  className?: string
  style?: React.CSSProperties
  children?: ReactNode
}

export function EditableText({ cmsKey, fallback = '', as = 'span', className = '', style, children }: EditableTextProps) {
  const cms = useCms()
  const [saving, setSaving] = useState(false)
  const Component = as as any
  const value = cms.text(cmsKey, fallback || (typeof children === 'string' ? children : ''))

  async function edit() {
    if (!cms.isAdmin || !cms.editMode || saving) return
    const nextValue = window.prompt('Edit website text. Type :revisions to view/restore history for this item.', value)
    if (nextValue === null || nextValue === value) return
    if (nextValue.trim() === ':revisions') {
      cms.openRevisions(cmsKey)
      return
    }
    setSaving(true)
    try {
      await cms.updateText(cmsKey, nextValue)
    } catch (error) {
      window.alert((error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (!cms.isAdmin || !cms.editMode) {
    return <Component className={className} style={style}>{value}</Component>
  }

  return (
    <span className="group/cms relative inline-block align-baseline">
      <Component
        className={`${className} cursor-pointer rounded-md outline outline-1 outline-dashed outline-violet-400/50 transition hover:bg-violet-100/25 hover:outline-violet-500 ${saving ? 'opacity-60' : ''}`}
        style={style}
        onClick={edit}
        title="Click to edit. Type :revisions in the edit prompt to view history."
      >
        {value}
      </Component>
    </span>
  )
}
