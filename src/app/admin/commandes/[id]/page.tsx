import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { OrderDetail } from '@/features/orders/components/order-detail'
import { OrderNoteForm } from '@/features/orders/components/order-note-form'
import { OrderStatusActions } from '@/features/orders/components/order-status-actions'
import { getOrderById } from '@/features/orders/queries'

export const metadata: Metadata = {
  title: 'Détail commande',
}

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/admin/commandes" className="text-muted-foreground hover:text-foreground">
          ← Toutes les commandes
        </Link>
      </nav>

      <OrderDetail order={order} showInternalNotes />

      <section className="bg-card border-border space-y-3 rounded-lg border p-4 shadow-sm sm:p-6">
        <div>
          <h2 className="text-sm font-semibold">Transitions de statut</h2>
          <p className="text-muted-foreground text-xs">
            Les transitions respectent la machine à états. Le client est notifié à chaque
            changement.
          </p>
        </div>
        <OrderStatusActions orderId={order.id} currentStatus={order.status} />
      </section>

      <section className="bg-card border-border rounded-lg border p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold">Notes internes</h2>
        <p className="text-muted-foreground text-xs">
          Ajoutez un commentaire visible uniquement par les administrateurs.
        </p>
        <div className="mt-3">
          <OrderNoteForm orderId={order.id} />
        </div>
      </section>

      {order.customer && (
        <section className="bg-card border-border rounded-lg border p-4 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold">Client</h2>
          <dl className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground text-xs">Nom</dt>
              <dd className="mt-0.5 font-medium">{order.customer.fullName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Téléphone</dt>
              <dd className="mt-0.5 font-medium">{order.customer.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">ID client</dt>
              <dd className="mt-0.5 font-mono text-xs break-all">{order.customer.id}</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  )
}
