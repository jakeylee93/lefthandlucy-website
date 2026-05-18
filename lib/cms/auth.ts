import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'
import type { NextResponse } from 'next/server'

const COOKIE_NAME = 'lhl_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 8

type SessionPayload = { role: 'admin'; exp: number }

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD
  if (!secret) return null
  return secret
}

function sign(data: string, secret: string) {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  return safeEqual(password, expected)
}

export function createAdminSessionValue() {
  const secret = getSessionSecret()
  if (!secret) throw new Error('ADMIN_PASSWORD is required')
  const payload: SessionPayload = { role: 'admin', exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${data}.${sign(data, secret)}`
}

export function readAdminSessionValue(value?: string) {
  const secret = getSessionSecret()
  if (!secret || !value) return null
  const [data, signature] = value.split('.')
  if (!data || !signature || !safeEqual(signature, sign(data, secret))) return null
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as SessionPayload
    if (payload.role !== 'admin' || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export function isAdminRequest() {
  return Boolean(readAdminSessionValue(cookies().get(COOKIE_NAME)?.value))
}

export function requireAdmin() {
  if (!isAdminRequest()) {
    return { ok: false as const, status: 401, error: 'Admin session required' }
  }
  return { ok: true as const, user: 'admin' }
}

export function setAdminCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, createAdminSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
