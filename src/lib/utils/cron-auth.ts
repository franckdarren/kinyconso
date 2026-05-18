import 'server-only'

import { timingSafeEqual } from 'node:crypto'
import { type NextRequest } from 'next/server'

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

/**
 * Authentifie un appel cron via `Authorization: Bearer <CRON_SECRET>`.
 *
 * Le secret n'est volontairement PAS accepté en query string : il fuiterait
 * dans les logs Vercel, proxies et en-têtes Referer. Vercel Cron envoie
 * automatiquement le header Bearer dès que `CRON_SECRET` est défini.
 * Comparaison à temps constant pour éviter une attaque temporelle.
 */
export function isAuthorizedCron(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return false

  const header = request.headers.get('authorization')
  if (!header) return false

  return safeEqual(header, `Bearer ${expected}`)
}
