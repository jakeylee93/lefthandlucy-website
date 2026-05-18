import { promises as fs } from 'fs'
import * as path from 'path'
import { get, put } from '@vercel/blob'
import { CMS_DEFAULT_CONTENT, withCmsDefaults } from './content-defaults'
import type { CmsContentItem, CmsRevision, CmsState } from './types'

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN
const BLOB_PATH = process.env.CMS_BLOB_PATH || 'cms/left-hand-lucy-cms.json'
const KV_URL = process.env.KV_REST_API_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN
const KV_KEY = process.env.CMS_KV_KEY || 'left-hand-lucy:cms:v1'
const FILE_PATH = process.env.CMS_FILE_STORAGE_PATH || path.join(process.cwd(), '.cms-data', 'left-hand-lucy-cms.json')

class CmsStorageError extends Error {
  status = 503
}

function isFileStorageAllowed() {
  return Boolean(process.env.CMS_FILE_STORAGE_PATH) || process.env.NODE_ENV !== 'production'
}

export function getStorageMode() {
  if (BLOB_TOKEN) return { mode: 'vercel-blob', writable: true }
  if (KV_URL && KV_TOKEN) return { mode: 'vercel-kv', writable: true }
  if (isFileStorageAllowed()) return { mode: 'local-file-dev', writable: true }
  return { mode: 'unconfigured', writable: false }
}

function emptyState(): CmsState {
  return { content: {}, revisions: [] }
}

async function streamToString(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }
  return Buffer.concat(chunks).toString('utf8')
}

async function readBlobState(): Promise<CmsState> {
  if (!BLOB_TOKEN) throw new CmsStorageError('CMS Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN for Vercel Blob storage.')
  const result = await get(BLOB_PATH, { access: 'private', useCache: false, token: BLOB_TOKEN })
  if (!result || result.statusCode === 304 || !result.stream) return emptyState()
  return JSON.parse(await streamToString(result.stream)) as CmsState
}

async function writeBlobState(state: CmsState) {
  if (!BLOB_TOKEN) throw new CmsStorageError('CMS Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN for Vercel Blob storage.')
  await put(BLOB_PATH, JSON.stringify(state, null, 2), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
    token: BLOB_TOKEN,
  })
}

async function kvRequest(command: unknown[]) {
  if (!KV_URL || !KV_TOKEN) throw new CmsStorageError('CMS storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN for Vercel KV/Upstash storage.')
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  if (!res.ok) throw new CmsStorageError(`CMS storage request failed: ${res.status}`)
  return res.json() as Promise<{ result: unknown }>
}

async function readRawState(): Promise<CmsState> {
  if (BLOB_TOKEN) {
    return readBlobState()
  }

  if (KV_URL && KV_TOKEN) {
    const data = await kvRequest(['GET', KV_KEY])
    if (!data.result) return emptyState()
    return JSON.parse(String(data.result)) as CmsState
  }

  if (isFileStorageAllowed()) {
    try {
      return JSON.parse(await fs.readFile(FILE_PATH, 'utf8')) as CmsState
    } catch {
      return emptyState()
    }
  }

  return emptyState()
}

async function writeRawState(state: CmsState) {
  if (BLOB_TOKEN) {
    await writeBlobState(state)
    return
  }

  if (KV_URL && KV_TOKEN) {
    await kvRequest(['SET', KV_KEY, JSON.stringify(state)])
    return
  }

  if (isFileStorageAllowed()) {
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true })
    await fs.writeFile(FILE_PATH, JSON.stringify(state, null, 2))
    return
  }

  throw new CmsStorageError('CMS storage is not configured. Set BLOB_READ_WRITE_TOKEN for Vercel Blob storage, or KV_REST_API_URL and KV_REST_API_TOKEN for Vercel KV/Upstash storage.')
}

export async function getContent() {
  const state = await readRawState()
  return withCmsDefaults(state.content)
}

export async function getState() {
  const state = await readRawState()
  return { ...state, content: withCmsDefaults(state.content) }
}

function createRevision(contentKey: string, oldValue: string, newValue: string, createdBy = 'admin', action: CmsRevision['action'] = 'update'): CmsRevision {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    contentKey,
    oldValue,
    newValue,
    createdAt: new Date().toISOString(),
    createdBy,
    action,
  }
}

export async function upsertContent(contentKey: string, value: string, updatedBy = 'admin') {
  if (!CMS_DEFAULT_CONTENT[contentKey]) throw new Error(`Unknown CMS content key: ${contentKey}`)
  const state = await readRawState()
  const fallback = CMS_DEFAULT_CONTENT[contentKey]
  const current = state.content[contentKey] || fallback
  const oldValue = current.value || fallback.value
  const nextValue = value.trim() || fallback.value
  const revision = createRevision(contentKey, oldValue, nextValue, updatedBy, 'update')
  state.content[contentKey] = {
    ...fallback,
    ...current,
    value: nextValue,
    updatedAt: revision.createdAt,
    updatedBy,
  }
  state.revisions = [revision, ...(state.revisions || [])]
  await writeRawState(state)
  return { item: state.content[contentKey], revision }
}

export async function listRevisions(contentKey: string) {
  const state = await readRawState()
  return (state.revisions || []).filter((revision) => revision.contentKey === contentKey)
}

export async function restoreContentRevision(contentKey: string, revisionId: string, updatedBy = 'admin') {
  if (!CMS_DEFAULT_CONTENT[contentKey]) throw new Error(`Unknown CMS content key: ${contentKey}`)
  const state = await readRawState()
  const revisionToRestore = (state.revisions || []).find((revision) => revision.id === revisionId && revision.contentKey === contentKey)
  if (!revisionToRestore) throw new Error('Revision not found')
  const fallback = CMS_DEFAULT_CONTENT[contentKey]
  const current = state.content[contentKey] || fallback
  const oldValue = current.value || fallback.value
  const restoredValue = revisionToRestore.oldValue || fallback.value
  const restoreRevision = createRevision(contentKey, oldValue, restoredValue, updatedBy, 'restore')
  state.content[contentKey] = {
    ...fallback,
    ...current,
    value: restoredValue,
    updatedAt: restoreRevision.createdAt,
    updatedBy,
  }
  state.revisions = [restoreRevision, ...(state.revisions || [])]
  await writeRawState(state)
  return { item: state.content[contentKey], revision: restoreRevision }
}
