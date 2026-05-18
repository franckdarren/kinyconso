import { createHmac, timingSafeEqual } from 'node:crypto'

import { NextResponse, type NextRequest } from 'next/server'

import { pvitLog } from '@/features/payments/pvit/logger'
import { reconcilePvitPayment } from '@/features/payments/pvit/reconcile'
import { pvitCallbackPayloadSchema } from '@/features/payments/pvit/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Whitelist d'IP source PVIT (optionnelle).
 * `PVIT_CALLBACK_ALLOWED_IPS` = liste séparée par des virgules. Vide ⇒ pas de
 * filtrage IP (la sécurité repose alors sur la re-vérification serveur→PVIT).
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

/**
 * Vérifie une signature HMAC-SHA256 du corps brut si `PVIT_CALLBACK_HMAC_SECRET`
 * est configuré. La signature attendue est fournie via l'en-tête
 * `x-pvit-signature` (hex). Comparaison à temps constant.
 *
 * Renvoie `true` si non configuré (la garantie repose alors entièrement sur
 * la re-vérification serveur→PVIT plus bas).
 */
function isValidSignature(rawBody: string, request: NextRequest): boolean {
  const secret = process.env.PVIT_CALLBACK_HMAC_SECRET
  if (!secret) return true

  const provided = request.headers.get('x-pvit-signature')?.trim()
  if (!provided) return false

  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(provided, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    pvitLog.warn({
      event: 'pvit.callback.origin_rejected',
      ip: request.headers.get('x-forwarded-for') ?? null,
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const rawBody = await request.text()

  if (!isValidSignature(rawBody, request)) {
    pvitLog.warn({ event: 'pvit.callback.invalid_signature' })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let json: unknown
  try {
    json = JSON.parse(rawBody) as unknown
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

  // On ne fait JAMAIS confiance au `status`/`amount` du corps de requête :
  // le webhook n'est qu'un déclencheur. L'état faisant autorité est récupéré
  // côté serveur via l'API PVIT authentifiée (X-Secret).
  try {
    const result = await reconcilePvitPayment(parsed.data.merchantReferenceId)
    return NextResponse.json({
      transactionId: parsed.data.transactionId,
      responseCode: result.responseCode,
      handled: result.outcome?.handled ?? false,
    })
  } catch (error) {
    // Échec de re-vérification (réseau PVIT...) : on répond 200 pour éviter
    // les rejeux infinis. Le fallback /api/pvit/check-status + le cron
    // réconcilieront l'état ultérieurement.
    pvitLog.error({
      event: 'pvit.callback.reconcile_failed',
      merchantReferenceId: parsed.data.merchantReferenceId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({
      transactionId: parsed.data.transactionId,
      responseCode: parsed.data.responseCode,
      handled: false,
    })
  }
}
