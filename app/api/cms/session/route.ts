import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/cms/auth'

export async function GET() {
  return NextResponse.json({ isAdmin: isAdminRequest() })
}
