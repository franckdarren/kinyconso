import 'server-only'

import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { appConfig } from '@/db/schema'
import {
  PVIT_APP_CONFIG_KEY,
  PVIT_BASE_URL,
  PVIT_ENDPOINTS,
  PVIT_SECRET_REFRESH_MARGIN_MS,
  PVIT_SECRET_TTL_MS,
  getPvitServerEnv,
} from '@/config/pvit'

import { pvitLog } from './logger'
import { PvitError, type PvitAuthResponse, type PvitStoredSecret } from './types'

/**
 * Lit le secret stocké en base. Renvoie null si absent ou mal formé.
 */
async function readStoredSecret(): Promise<PvitStoredSecret | null> {
  const [row] = await db
    .select({ value: appConfig.value })
    .from(appConfig)
    .where(eq(appConfig.key, PVIT_APP_CONFIG_KEY))
    .limit(1)

  if (!row?.value || typeof row.value !== 'object') return null
  const v = row.value as Partial<PvitStoredSecret>
  if (typeof v.secret !== 'string' || typeof v.expiresAt !== 'string') return null
  return { secret: v.secret, expiresAt: v.expiresAt }
}

async function writeStoredSecret(secret: PvitStoredSecret): Promise<void> {
  await db
    .insert(appConfig)
    .values({
      key: PVIT_APP_CONFIG_KEY,
      value: secret,
      description: 'PVIT X-Secret + expiration (renouvelé par cron toutes les 50 min)',
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: appConfig.key,
      set: { value: secret, updatedAt: new Date() },
    })
}

function isExpired(stored: PvitStoredSecret): boolean {
  const expires = Date.parse(stored.expiresAt)
  if (Number.isNaN(expires)) return true
  return Date.now() >= expires - PVIT_SECRET_REFRESH_MARGIN_MS
}

/**
 * Appelle PVIT pour obtenir un nouveau X-Secret et le persiste en base.
 * À utiliser depuis le cron `/api/cron/pvit-token` ou en fallback si
 * `getValidToken()` détecte un secret expiré.
 */
export async function refreshToken(): Promise<PvitStoredSecret> {
  const env = getPvitServerEnv()
  const startedAt = Date.now()

  const url = `${PVIT_BASE_URL}${PVIT_ENDPOINTS.auth}`
  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ urlCode: env.urlCode, apiPassword: env.apiPassword }),
      cache: 'no-store',
    })
  } catch (cause) {
    pvitLog.error({
      event: 'pvit.token.refresh.network_error',
      error: cause instanceof Error ? cause.message : String(cause),
      durationMs: Date.now() - startedAt,
    })
    throw new PvitError('Échec réseau lors du renouvellement du X-Secret PVIT', {
      body: cause instanceof Error ? cause.message : cause,
    })
  }

  const durationMs = Date.now() - startedAt
  let body: unknown
  try {
    body = await response.json()
  } catch {
    body = await response.text().catch(() => null)
  }

  if (!response.ok) {
    pvitLog.error({
      event: 'pvit.token.refresh.http_error',
      httpStatus: response.status,
      durationMs,
      body,
    })
    throw new PvitError(`PVIT auth HTTP ${response.status}`, {
      httpStatus: response.status,
      body,
    })
  }

  const data = body as Partial<PvitAuthResponse>
  if (!data || typeof data.secret !== 'string' || data.secret.length === 0) {
    pvitLog.error({ event: 'pvit.token.refresh.invalid_response', durationMs, body })
    throw new PvitError('Réponse PVIT auth invalide : secret manquant', { body })
  }

  const ttlMs =
    typeof data.expiresIn === 'number' && data.expiresIn > 0
      ? data.expiresIn * 1000
      : PVIT_SECRET_TTL_MS

  const stored: PvitStoredSecret = {
    secret: data.secret,
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
  }

  await writeStoredSecret(stored)

  pvitLog.info({
    event: 'pvit.token.refresh.success',
    durationMs,
    expiresAt: stored.expiresAt,
  })

  return stored
}

/**
 * Renvoie un X-Secret valide. Rafraîchit automatiquement si la valeur
 * stockée est manquante ou proche de l'expiration.
 */
export async function getValidToken(): Promise<string> {
  const stored = await readStoredSecret()
  if (stored && !isExpired(stored)) {
    return stored.secret
  }
  pvitLog.info({
    event: stored ? 'pvit.token.expired' : 'pvit.token.missing',
    expiresAt: stored?.expiresAt,
  })
  const refreshed = await refreshToken()
  return refreshed.secret
}

/**
 * Force la suppression du secret en cache. Utile pour les tests
 * ou en cas de rotation côté PVIT.
 */
export async function invalidateToken(): Promise<void> {
  await db.delete(appConfig).where(eq(appConfig.key, PVIT_APP_CONFIG_KEY))
  pvitLog.warn({ event: 'pvit.token.invalidated' })
}
