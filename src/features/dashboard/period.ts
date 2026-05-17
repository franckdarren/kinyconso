import type { PeriodRange } from './queries'

export type PeriodKey = 'today' | '7d' | '30d' | '90d'

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  today: "Aujourd'hui",
  '7d': '7 jours',
  '30d': '30 jours',
  '90d': '90 jours',
}

export const PERIOD_DAYS: Record<PeriodKey, number> = {
  today: 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

export function isPeriodKey(value: string | null | undefined): value is PeriodKey {
  return value === 'today' || value === '7d' || value === '30d' || value === '90d'
}

/**
 * Construit la plage [from, to[ correspondant au filtre choisi.
 * `to` est toujours « maintenant + 1 ms » pour inclure les commandes en cours.
 */
export function getPeriodRange(period: PeriodKey, now = new Date()): PeriodRange {
  const to = new Date(now.getTime() + 1)
  const from = new Date(now)
  if (period === 'today') {
    from.setHours(0, 0, 0, 0)
  } else {
    const days = PERIOD_DAYS[period]
    from.setHours(0, 0, 0, 0)
    from.setDate(from.getDate() - (days - 1))
  }
  return { from, to }
}
