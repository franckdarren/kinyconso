import type { Metadata } from 'next'

import { LowStock } from '@/features/dashboard/components/low-stock'
import { PeriodTabs } from '@/features/dashboard/components/period-tabs'
import { RecentOrders } from '@/features/dashboard/components/recent-orders'
import { RevenueChart } from '@/features/dashboard/components/revenue-chart'
import { StatsCards } from '@/features/dashboard/components/stats-cards'
import { TopProducts } from '@/features/dashboard/components/top-products'
import {
  getPeriodRange,
  isPeriodKey,
  PERIOD_DAYS,
  type PeriodKey,
} from '@/features/dashboard/period'
import {
  getDashboardStats,
  getLowStockProducts,
  getRevenueSeries,
  getTopProducts,
} from '@/features/dashboard/queries'
import { getAllOrders } from '@/features/orders/queries'

export const metadata: Metadata = {
  title: 'Tableau de bord admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ period?: string }>
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const { period: periodParam } = await searchParams
  const period: PeriodKey = isPeriodKey(periodParam) ? periodParam : '30d'
  const range = getPeriodRange(period)
  const chartDays = Math.max(PERIOD_DAYS[period], 7)

  const [stats, series, topProducts, lowStock, recent] = await Promise.all([
    getDashboardStats(range),
    getRevenueSeries(chartDays, range.to),
    getTopProducts(range, 5),
    getLowStockProducts(8),
    getAllOrders({ page: 1, pageSize: 8 }),
  ])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm">
            Vue d&apos;ensemble de votre activité. Les statuts non payés (en attente, annulées,
            remboursées) sont exclus du chiffre d&apos;affaires.
          </p>
        </div>
        <PeriodTabs active={period} />
      </header>

      <StatsCards stats={stats} />

      <RevenueChart data={series} />

      <div className="grid gap-4 lg:grid-cols-2">
        <TopProducts products={topProducts} />
        <LowStock products={lowStock} />
      </div>

      <RecentOrders orders={recent.rows} />
    </div>
  )
}
