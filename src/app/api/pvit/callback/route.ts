import { NextResponse, type NextRequest } from 'next/server'

import { pvitLog } from '@/features/payments/pvit/logger'
import { processPvitCallback } from '@/features/payments/pvit/process-callback'
import { pvitCallbackPayloadSchema } from '@/features/payments/pvit/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Whitelist d'IP source PVIT.
 * Tant que PVIT n'a pas communiqué une liste fixe, on garde la vérification
 * désactivée (variable d'env `PVIT_CALLBACK_ALLOWED_IPS` séparée par des
 * virgules). Si la variable est vide, on accepte toute origine — la sécurité
 * repose alors sur l'idempotence + signature (futur).
 */
function isAllowedOrigin(request: NextRequest): boolean {
  const allowed = process.env.PVIT_CALLBACK_ALLOWED_IPS
  if (!allowed) return true
  const list = allowed
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (list.length === 0) return true
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim()
  if (!ip) return false
  return list.includes(ip)
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    pvitLog.warn({
      event: 'pvit.callback.origin_rejected',
      ip: request.headers.get('x-forwarded-for') ?? null,
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    pvitLog.warn({ event: 'pvit.callback.invalid_json' })
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const parsed = pvitCallbackPayloadSchema.safeParse(json)
  if (!parsed.success) {
    pvitLog.warn({
      event: 'pvit.callback.invalid_payload',
      fieldErrors: parsed.error.flatten().fieldErrors,
    })
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 })
  }

  try {
    const outcome = await processPvitCallback(parsed.data)
    // PVIT attend toujours { transactionId, responseCode }, même en cas
    // de référence inconnue : on répond 200 pour éviter les rejeux infinis.
    return NextResponse.json({
      transactionId: parsed.data.transactionId,
      responseCode: parsed.data.responseCode,
      handled: outcome.handled,
    })
  } catch (error) {
    pvitLog.error({
      event: 'pvit.callback.processing_failed',
      merchantReferenceId: parsed.data.merchantReferenceId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
