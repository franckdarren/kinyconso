import { NextResponse, type NextRequest } from 'next/server'
import { sql, eq } from 'drizzle-orm'

import { db } from '@/db'
import { appConfig } from '@/db/schema'
import { PVIT_APP_CONFIG_KEY, PVIT_SECRET_REFRESH_MARGIN_MS } from '@/config/pvit'
import { isFcmConfigured } from '@/config/fcm'
import { isAuthorizedCron } from '@/lib/utils/cron-auth'
import type { PvitStoredSecret } from '@/features/payments/pvit/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export type ServiceStatus = 'ok' | 'degraded' | 'down'

export interface ServiceCheck {
  status: ServiceStatus
  latencyMs?: number
  detail?: string
}

export interface HealthPayload {
  status: ServiceStatus
  checkedAt: string
  services: {
    database: ServiceCheck
    pvit: ServiceCheck
    fcm: ServiceCheck
  }
}

async function checkDatabase(): Promise<ServiceCheck> {
  const start = Date.now()
  try {
    await db.execute(sql`SELECT 1`)
    return { status: 'ok', latencyMs: Date.now() - start }
  } catch (err) {
    return {
      status: 'down',
      latencyMs: Date.now() - start,
      detail: err instanceof Error ? err.message : 'Erreur inconnue',
    }
  }
}

async function checkPvit(): Promise<ServiceCheck> {
  const start = Date.now()
  try {
    const [row] = await db
      .select({ value: appConfig.value })
      .from(appConfig)
      .where(eq(appConfig.key, PVIT_APP_CONFIG_KEY))
      .limit(1)

    if (!row?.value || typeof row.value !== 'object') {
      return { status: 'down', latencyMs: Date.now() - start, detail: 'Token absent en base' }
    }

    const stored = row.value as Partial<PvitStoredSecret>
    if (!stored.secret || !stored.expiresAt) {
      return { status: 'down', latencyMs: Date.now() - start, detail: 'Token malformé' }
    }

    const expiresAt = Date.parse(stored.expiresAt)
    if (Number.isNaN(expiresAt)) {
      return { status: 'down', latencyMs: Date.now() - start, detail: 'Date expiration invalide' }
    }

    const remainingMs = expiresAt - Date.now()
    if (remainingMs <= 0) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        detail: `Token expiré depuis ${Math.round(-remainingMs / 60000)} min`,
      }
    }

    if (remainingMs <= PVIT_SECRET_REFRESH_MARGIN_MS) {
      return {
        status: 'degraded',
        latencyMs: Date.now() - start,
        detail: `Token expire dans ${Math.round(remainingMs / 60000)} min (renouvellement imminent)`,
      }
    }

    return {
      status: 'ok',
      latencyMs: Date.now() - start,
      detail: `Expire dans ${Math.round(remainingMs / 60000)} min`,
    }
  } catch (err) {
    return {
      status: 'down',
      latencyMs: Date.now() - start,
      detail: err instanceof Error ? err.message : 'Erreur inconnue',
    }
  }
}

function checkFcm(): ServiceCheck {
  const configured = isFcmConfigured()
  const hasServerVars = Boolean(
    process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY,
  )

  if (!configured || !hasServerVars) {
    const missing = []
    if (!configured) missing.push('variables client NEXT_PUBLIC_FIREBASE_*')
    if (!hasServerVars) missing.push('FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY')
    return { status: 'down', detail: `Manquantes : ${missing.join(' · ')}` }
  }

  return { status: 'ok', detail: 'Variables configurées' }
}

function worstStatus(statuses: ServiceStatus[]): ServiceStatus {
  if (statuses.includes('down')) return 'down'
  if (statuses.includes('degraded')) return 'degraded'
  return 'ok'
}

/** Retire les champs sensibles (messages d'erreur DB, latences, état infra). */
function redact(check: ServiceCheck): ServiceCheck {
  return { status: check.status }
}

export async function GET(request: NextRequest) {
  const [database, pvit] = await Promise.all([checkDatabase(), checkPvit()])
  const fcm = checkFcm()

  const services = { database, pvit, fcm }
  const overall = worstStatus(Object.values(services).map((s) => s.status))

  // Les détails (messages d'erreur, latences, état du token PVIT) ne sont
  // exposés qu'aux appelants authentifiés. Un moniteur d'uptime anonyme ne
  // reçoit que les statuts agrégés.
  const detailed = isAuthorizedCron(request)

  const payload: HealthPayload = {
    status: overall,
    checkedAt: new Date().toISOString(),
    services: detailed
      ? services
      : { database: redact(database), pvit: redact(pvit), fcm: redact(fcm) },
  }

  const httpStatus = overall === 'down' ? 503 : 200
  return NextResponse.json(payload, { status: httpStatus })
}
