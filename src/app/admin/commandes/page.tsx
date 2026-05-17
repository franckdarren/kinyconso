import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { OrderList } from '@/features/orders/components/order-list'
import { OrdersFiltersBar } from '@/features/orders/components/orders-filters-bar'
import { getAllOrders } from '@/features/orders/queries'
import type { OrderStatus } from '@/db/schema/enums'

export const metadata: Metadata = {
  title: 'Commandes',
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    status?: string
    search?: string
    from?: string
    to?: string
    page?: string
  }>
}

const ALLOWED_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]

function parseDate(value?: string): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const statusParam = sp.status
  const status =
    statusParam && (ALLOWED_STATUSES as string[]).includes(statusParam)
      ? (statusParam as OrderStatus)
      : 'all'
  const page = Math.max(Number(sp.page ?? '1') || 1, 1)

  const { rows, total, pageCount } = await getAllOrders({
    status,
    search: sp.search,
    from: parseDate(sp.from),
    to: parseDate(sp.to),
    page,
    pageSize: 20,
  })

  const buildPageHref = (target: number) => {
    const next = new URLSearchParams()
    if (sp.status) next.set('status', sp.status)
    if (sp.search) next.set('search', sp.search)
    if (sp.from) next.set('from', sp.from)
    if (sp.to) next.set('to', sp.to)
    next.set('page', String(target))
    return `/admin/commandes?${next.toString()}`
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground text-sm">{total} commande(s) au total</p>
        </div>
      </header>

      <OrdersFiltersBar />

      <OrderList
        rows={rows}
        basePath="/admin/commandes"
        emptyLabel="Aucune commande ne correspond à ces filtres."
        showCustomer
      />

      {pageCount > 1 && (
        <nav
          aria-label="Pagination des commandes"
          className="flex items-center justify-between text-sm"
        >
          <Button asChild variant="ghost" size="sm" disabled={page <= 1}>
            <Link href={buildPageHref(Math.max(page - 1, 1))}>← Précédent</Link>
          </Button>
          <span className="text-muted-foreground">
            Page {page} / {pageCount}
          </span>
          <Button asChild variant="ghost" size="sm" disabled={page >= pageCount}>
            <Link href={buildPageHref(Math.min(page + 1, pageCount))}>Suivant →</Link>
          </Button>
        </nav>
      )}
    </div>
  )
}
