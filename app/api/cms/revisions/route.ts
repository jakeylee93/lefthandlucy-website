import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/cms/auth'
import { listRevisions } from '@/lib/cms/storage'

export async function GET(request: Request) {
  const admin = requireAdmin()
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status })
  const key = new URL(request.url).searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'Content key is required' }, { status: 400 })
  return NextResponse.json({ revisions: await listRevisions(key) })
}
