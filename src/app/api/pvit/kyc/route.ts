import { NextResponse, type NextRequest } from 'next/server'

import { getCurrentUser } from '@/features/auth/queries/get-current-user'
import { pvitKyc } from '@/features/payments/pvit/client'
import { pvitLog } from '@/features/payments/pvit/logger'
import { kycRequestSchema } from '@/features/payments/pvit/schemas'
import { PvitError } from '@/features/payments/pvit/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Vérification KYC PVIT : renvoie le nom associé au numéro Mobile Money.
 * Réservé aux utilisateurs authentifiés (pour limiter l'usage abusif).
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const parsed = kycRequestSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  try {
    const result = await pvitKyc(parsed.data)
    return NextResponse.json({
      matched: result.matched,
      fullName: result.fullName ?? null,
      responseCode: result.responseCode,
      message: result.message ?? null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur PVIT'
    pvitLog.error({
      event: 'pvit.route.kyc.failed',
      error: message,
    })
    const httpStatus = error instanceof PvitError && error.httpStatus ? error.httpStatus : 502
    return NextResponse.json({ error: message }, { status: httpStatus })
  }
}
