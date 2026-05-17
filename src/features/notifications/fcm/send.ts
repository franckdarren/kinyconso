import 'server-only'

import { createSign } from 'node:crypto'

import {
  FCM_HTTP_V1_SCOPE,
  fcmHttpV1Endpoint,
  getFcmServerEnv,
  type FcmServerEnv,
} from '@/config/fcm'

interface AccessTokenCacheEntry {
  token: string
  expiresAt: number
}

let accessTokenCache: AccessTokenCacheEntry | null = null

function base64UrlEncode(input: Buffer | string): string {
  const buffer = typeof input === 'string' ? Buffer.from(input) : input
  return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

/**
 * Génère un JWT signé RS256 pour échanger contre un access token Google.
 * Documentation : https://developers.google.com/identity/protocols/oauth2/service-account
 */
function buildGoogleJwt(env: FcmServerEnv): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: env.clientEmail,
      scope: FCM_HTTP_V1_SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  )
  const toSign = `${header}.${payload}`
  const signature = createSign('RSA-SHA256').update(toSign).sign(env.privateKey)
  return `${toSign}.${base64UrlEncode(signature)}`
}

async function fetchAccessToken(env: FcmServerEnv): Promise<AccessTokenCacheEntry> {
  const jwt = buildGoogleJwt(env)
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  })
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Echec récupération access token Google (${res.status}) : ${text}`)
  }
  const json = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!json.access_token) {
    throw new Error('Access token Google manquant dans la réponse')
  }
  const ttl = (json.expires_in ?? 3600) * 1000
  return {
    token: json.access_token,
    expiresAt: Date.now() + ttl - 60_000,
  }
}

async function getAccessToken(env: FcmServerEnv): Promise<string> {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.token
  }
  accessTokenCache = await fetchAccessToken(env)
  return accessTokenCache.token
}

export interface FcmPushPayload {
  title: string
  body: string
  data?: Record<string, string>
  link?: string
}

export interface FcmPushResult {
  ok: boolean
  messageId?: string
  invalidToken?: boolean
  error?: string
}

/**
 * Envoie une notification push FCM via HTTP v1.
 *
 * - Retourne `{ ok: true, messageId }` en cas de succès.
 * - Si FCM renvoie `UNREGISTERED` / `INVALID_ARGUMENT` sur le token, on
 *   marque `invalidToken: true` pour que l'appelant puisse nettoyer le
 *   `users.fcm_token` côté DB.
 * - Ne lance jamais : les erreurs sont retournées dans `error` afin de ne
 *   pas faire échouer une transition métier.
 */
export async function sendFcmPush(token: string, payload: FcmPushPayload): Promise<FcmPushResult> {
  let env: FcmServerEnv
  try {
    env = getFcmServerEnv()
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }

  let accessToken: string
  try {
    accessToken = await getAccessToken(env)
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }

  const message = {
    message: {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        ...(payload.data ?? {}),
        ...(payload.link ? { link: payload.link } : {}),
      },
      webpush: {
        fcm_options: payload.link ? { link: payload.link } : undefined,
        notification: {
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
        },
      },
    },
  }

  let res: Response
  try {
    res = await fetch(fcmHttpV1Endpoint(env.projectId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }

  if (res.ok) {
    const json = (await res.json().catch(() => ({}))) as { name?: string }
    return { ok: true, messageId: json.name }
  }

  const text = await res.text().catch(() => '')
  const lower = text.toLowerCase()
  const invalidToken =
    res.status === 404 ||
    lower.includes('unregistered') ||
    lower.includes('invalid_argument') ||
    lower.includes('not a valid fcm registration token')

  return {
    ok: false,
    invalidToken,
    error: `FCM ${res.status}: ${text.slice(0, 200)}`,
  }
}
