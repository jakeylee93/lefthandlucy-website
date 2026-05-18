import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/cms/auth'
import { restoreContentRevision } from '@/lib/cms/storage'

export async function POST(request: Request) {
  const admin = requireAdmin()
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status })
  const body = await request.json().catch(() => null)
  if (!body?.key || !body?.revisionId) {
    return NextResponse.json({ error: 'Content key and revisionId are required' }, { status: 400 })
  }

  try {
    const result = await restoreContentRevision(String(body.key), String(body.revisionId), admin.user)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const status = typeof (error as { status?: number }).status === 'number' ? (error as { status: number }).status : 400
    return NextResponse.json({ error: (error as Error).message }, { status })
  }
}
