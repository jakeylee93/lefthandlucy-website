import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/cms/auth'
import { getContent, getStorageMode, upsertContent } from '@/lib/cms/storage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const content = await getContent()
  return NextResponse.json({ content, storage: getStorageMode() })
}

export async function PUT(request: Request) {
  const admin = requireAdmin()
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status })

  const body = await request.json().catch(() => null)
  if (!body?.key || typeof body.value !== 'string') {
    return NextResponse.json({ error: 'Content key and value are required' }, { status: 400 })
  }

  try {
    const result = await upsertContent(String(body.key), body.value, admin.user)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const status = typeof (error as { status?: number }).status === 'number' ? (error as { status: number }).status : 400
    return NextResponse.json({ error: (error as Error).message }, { status })
  }
}
