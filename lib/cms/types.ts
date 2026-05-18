export type CmsContentType = 'shortText' | 'longText'

export type CmsContentItem = {
  key: string
  label: string
  page: string
  section: string
  type: CmsContentType
  value: string
  updatedAt?: string
  updatedBy?: string
}

export type CmsRevision = {
  id: string
  contentKey: string
  oldValue: string
  newValue: string
  createdAt: string
  createdBy: string
  action: 'update' | 'restore'
}

export type CmsState = {
  content: Record<string, CmsContentItem>
  revisions: CmsRevision[]
}

export type CmsPublicPayload = {
  content: Record<string, CmsContentItem>
  storage: {
    mode: string
    writable: boolean
  }
}
