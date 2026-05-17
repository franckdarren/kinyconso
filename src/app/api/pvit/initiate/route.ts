import { NextResponse, type NextRequest } from 'next/server'

import { getCurrentUser } from '@/features/auth/queries/get-current-user'
import { initiatePvitPayment } from '@/features/payments/pvit/initiate-payment'
import { pvitLog } from '@/features/payments/pvit/logger'
import { initiatePaymentSchema } from '@/features/payments/pvit/schemas'
import { PvitError } from '@/features/payments/pvit/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

  const parsed = initiatePaymentSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  try {
    const result = await initiatePvitPayment(parsed.data, {
      userId: user.id,
      customerEmail: user.email,
      customerName: user.fullName,
    })
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    pvitLog.error({
      event: 'pvit.route.initiate.failed',
      error: message,
    })
    const httpStatus =
      error instanceof PvitError
        ? error.httpStatus && error.httpStatus >= 400 && error.httpStatus < 500
          ? error.httpStatus
          : 502
        : 500
    return NextResponse.json({ error: message }, { status: httpStatus })
  }
}
