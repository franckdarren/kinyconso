import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getCustomerById } from '@/features/customers/queries'
import { OrderList } from '@/features/orders/components/order-list'
import { getUserOrders } from '@/features/orders/queries'
import { formatPrice } from '@/lib/utils/format-price'

export const metadata: Metadata = {
  title: 'Détail client',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
})

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const { id } = await params
  const [customer, orders] = await Promise.all([getCustomerById(id), getUserOrders(id)])
  if (!customer) notFound()

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/admin/clients" className="text-muted-foreground hover:text-foreground">
          ← Tous les clients
        </Link>
      </nav>

      <header className="bg-card border-border rounded-lg border p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {customer.fullName ?? 'Client sans nom'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Inscrit le {dateFormatter.format(customer.createdAt)}
              {customer.role === 'admin' && (
                <span className="bg-primary/10 text-primary ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                  Administrateur
                </span>
              )}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground text-xs">Téléphone</dt>
            <dd className="mt-0.5 font-medium">{customer.phone ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Ville</dt>
            <dd className="mt-0.5 font-medium">{customer.city ?? '—'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground text-xs">Adresse</dt>
            <dd className="mt-0.5 font-medium">{customer.address ?? '—'}</dd>
          </div>
        </dl>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Commandes payées" value={String(customer.ordersCount)} />
        <Stat label="Total dépensé" value={formatPrice(customer.totalSpent)} />
        <Stat label="Panier moyen" value={formatPrice(customer.averageOrderValue)} />
        <Stat
          label="Dernière commande"
          value={
            customer.lastOrderAt
              ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(
                  customer.lastOrderAt,
                )
              : '—'
          }
        />
      </div>

      <section className="bg-card border-border space-y-3 rounded-lg border p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold">Historique des commandes</h2>
        <OrderList
          rows={orders}
          basePath="/admin/commandes"
          emptyLabel="Ce client n'a encore passé aucune commande."
        />
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border-border rounded-lg border p-3 shadow-sm">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  )
}
