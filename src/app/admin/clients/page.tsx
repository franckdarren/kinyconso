import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { CustomersSearch } from '@/features/customers/components/customers-search'
import { CustomersTable } from '@/features/customers/components/customers-table'
import { getAllCustomers } from '@/features/customers/queries'

export const metadata: Metadata = {
  title: 'Clients',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(Number(sp.page ?? '1') || 1, 1)

  const { rows, total, pageCount } = await getAllCustomers({
    search: sp.search,
    page,
    pageSize: 20,
  })

  const buildPageHref = (target: number) => {
    const next = new URLSearchParams()
    if (sp.search) next.set('search', sp.search)
    next.set('page', String(target))
    return `/admin/clients?${next.toString()}`
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-muted-foreground text-sm">{total} client(s) inscrit(s)</p>
        </div>
      </header>

      <CustomersSearch />

      <CustomersTable rows={rows} />

      {pageCount > 1 && (
        <nav
          aria-label="Pagination des clients"
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
