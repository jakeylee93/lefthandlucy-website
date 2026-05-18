import { NextResponse } from 'next/server'
import { setAdminCookie, verifyAdminPassword } from '@/lib/cms/auth'

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: '' }))
  if (!verifyAdminPassword(String(password || ''))) {
    return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 })
  }
  const response = NextResponse.json({ ok: true })
  setAdminCookie(response)
  return response
}
