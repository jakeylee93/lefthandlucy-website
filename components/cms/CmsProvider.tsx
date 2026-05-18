'use client'

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CMS_DEFAULT_CONTENT } from '@/lib/cms/content-defaults'
import type { CmsContentItem } from '@/lib/cms/types'

type CmsContextValue = {
  content: Record<string, CmsContentItem>
  isAdmin: boolean
  editMode: boolean
  storageWritable: boolean
  storageMode: string
  setEditMode: (value: boolean) => void
  text: (key: string, fallback?: string) => string
  updateText: (key: string, value: string) => Promise<void>
  logout: () => Promise<void>
  revisionKey: string | null
  openRevisions: (key: string) => void
  closeRevisions: () => void
  refreshContent: () => Promise<void>
}

const CmsContext = createContext<CmsContextValue | null>(null)

export function CmsProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<string, CmsContentItem>>(CMS_DEFAULT_CONTENT)
  const [isAdmin, setIsAdmin] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [storageWritable, setStorageWritable] = useState(false)
  const [storageMode, setStorageMode] = useState('loading')
  const [revisionKey, setRevisionKey] = useState<string | null>(null)

  const refreshContent = useCallback(async () => {
    const response = await fetch('/api/cms/content', { cache: 'no-store' })
    const payload = await response.json()
    if (payload.content) setContent(payload.content)
    if (payload.storage) {
      setStorageWritable(Boolean(payload.storage.writable))
      setStorageMode(payload.storage.mode || 'unknown')
    }
  }, [])

  useEffect(() => {
    refreshContent().catch(() => undefined)
    fetch('/api/cms/session', { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload) => setIsAdmin(Boolean(payload.isAdmin)))
      .catch(() => setIsAdmin(false))
  }, [refreshContent])

  const value = useMemo<CmsContextValue>(() => ({
    content,
    isAdmin,
    editMode,
    storageWritable,
    storageMode,
    setEditMode,
    text: (key, fallback = '') => content[key]?.value || fallback || CMS_DEFAULT_CONTENT[key]?.value || '',
    updateText: async (key, nextValue) => {
      const response = await fetch('/api/cms/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: nextValue }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Could not save content')
      if (payload.item) setContent((current) => ({ ...current, [key]: payload.item }))
    },
    logout: async () => {
      await fetch('/api/cms/logout', { method: 'POST' })
      setIsAdmin(false)
      setEditMode(false)
      window.location.href = '/'
    },
    revisionKey,
    openRevisions: setRevisionKey,
    closeRevisions: () => setRevisionKey(null),
    refreshContent,
  }), [content, editMode, isAdmin, refreshContent, revisionKey, storageMode, storageWritable])

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>
}

export function useCms() {
  const context = useContext(CmsContext)
  if (!context) throw new Error('useCms must be used inside CmsProvider')
  return context
}
