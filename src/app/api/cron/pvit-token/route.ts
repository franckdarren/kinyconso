import { NextResponse, type NextRequest } from 'next/server'

import { pvitLog, refreshToken, PvitError } from '@/features/payments/pvit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Cron Vercel — rafraîchit le X-Secret PVIT toutes les 50 minutes.
 * Le secret expire toutes les 3600s côté PVIT, on garde donc une marge.
 *
 * Authentification : header `Authorization: Bearer <CRON_SECRET>`
 * (format envoyé par Vercel Cron) OU query string `?secret=<CRON_SECRET>`
 * pour faciliter les tests manuels en local.
 */
function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return false

  const header = request.headers.get('authorization')
  if (header === `Bearer ${expected}`) return true

  const querySecret = request.nextUrl.searchParams.get('secret')
  if (querySecret && querySecret === expected) return true

  return false
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    pvitLog.warn({ event: 'pvit.cron.unauthorized' })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stored = await refreshToken()
    return NextResponse.json({
      success: true,
      expiresAt: stored.expiresAt,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const httpStatus = error instanceof PvitError ? (error.httpStatus ?? 502) : 500
    pvitLog.error({ event: 'pvit.cron.failed', error: message })
    return NextResponse.json({ success: false, error: message }, { status: httpStatus })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
