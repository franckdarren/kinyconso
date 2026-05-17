import 'server-only'

import { and, count, countDistinct, gte, lt, ne, notInArray, sql, sum } from 'drizzle-orm'

import { db } from '@/db'
import { orders, users } from '@/db/schema'
import type { OrderStatus } from '@/db/schema/enums'

/**
 * Statuts considérés comme "chiffrés" pour le calcul du CA.
 *
 * - `pending` : pas encore payé, on ne compte pas.
 * - `cancelled` : annulé, on ne compte pas (payment refund hors scope code).
 * - `refunded` : remboursé, on ne compte pas pour ne pas gonfler le CA.
 *
 * Tout le reste (`confirmed`, `processing`, `shipped`, `delivered`) compte.
 */
const REVENUE_EXCLUDED_STATUSES: OrderStatus[] = ['pending', 'cancelled', 'refunded']

export interface PeriodRange {
  from: Date
  to: Date
}

export interface DashboardStats {
  revenue: number
  ordersCount: number
  customersCount: number
  averageOrderValue: number
  paidOrdersCount: number
}

/**
 * Renvoie les KPI agrégés sur une période [from, to[.
 *
 * - `revenue` : somme des `orders.total` (hors pending/cancelled/refunded).
 * - `ordersCount` : nombre total de commandes créées sur la période (tous statuts).
 * - `paidOrdersCount` : nombre de commandes payées (utilisé pour le panier moyen).
 * - `customersCount` : nombre de clients distincts ayant passé une commande.
 * - `averageOrderValue` : `revenue / paidOrdersCount` (FCFA entiers).
 */
export async function getDashboardStats(range: PeriodRange): Promise<DashboardStats> {
  const dateCondition = and(gte(orders.createdAt, range.from), lt(orders.createdAt, range.to))

  const [revenueRow] = await db
    .select({
      revenue: sum(orders.total).mapWith(Number),
      paidCount: count(),
    })
    .from(orders)
    .where(and(dateCondition, notInArray(orders.status, REVENUE_EXCLUDED_STATUSES)))

  const [ordersRow] = await db.select({ n: count() }).from(orders).where(dateCondition)

  const [customersRow] = await db
    .select({ n: countDistinct(orders.userId) })
    .from(orders)
    .where(and(dateCondition, ne(orders.status, 'cancelled')))

  const revenue = Number(revenueRow?.revenue ?? 0)
  const paidOrdersCount = Number(revenueRow?.paidCount ?? 0)
  const ordersCount = Number(ordersRow?.n ?? 0)
  const customersCount = Number(customersRow?.n ?? 0)
  const averageOrderValue = paidOrdersCount > 0 ? Math.round(revenue / paidOrdersCount) : 0

  return {
    revenue,
    ordersCount,
    customersCount,
    paidOrdersCount,
    averageOrderValue,
  }
}

export interface RevenuePoint {
  date: string
  revenue: number
  orders: number
}

/**
 * Renvoie la série journalière du CA sur les `days` derniers jours, jusqu'à
 * `to` exclu. Les jours sans vente sont remplis à 0 pour éviter des trous
 * dans la courbe.
 */
export async function getRevenueSeries(days: number, to: Date): Promise<RevenuePoint[]> {
  const safeDays = Math.max(1, Math.min(days, 365))
  const from = new Date(to)
  from.setUTCHours(0, 0, 0, 0)
  from.setUTCDate(from.getUTCDate() - (safeDays - 1))

  const dateExpr = sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`

  const rows = await db
    .select({
      day: dateExpr,
      revenue: sum(orders.total).mapWith(Number),
      orders: count(),
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, from),
        lt(orders.createdAt, to),
        notInArray(orders.status, REVENUE_EXCLUDED_STATUSES),
      ),
    )
    .groupBy(dateExpr)

  const map = new Map<string, RevenuePoint>()
  for (const row of rows) {
    map.set(row.day, {
      date: row.day,
      revenue: Number(row.revenue ?? 0),
      orders: Number(row.orders ?? 0),
    })
  }

  const series: RevenuePoint[] = []
  for (let i = 0; i < safeDays; i++) {
    const d = new Date(from)
    d.setUTCDate(from.getUTCDate() + i)
    const key = d.toISOString().slice(0, 10)
    series.push(map.get(key) ?? { date: key, revenue: 0, orders: 0 })
  }
  return series
}

export interface NewCustomersStat {
  total: number
}

export async function getTotalCustomersCount(): Promise<NewCustomersStat> {
  const [row] = await db.select({ n: count() }).from(users).where(ne(users.role, 'admin'))
  return { total: Number(row?.n ?? 0) }
}
