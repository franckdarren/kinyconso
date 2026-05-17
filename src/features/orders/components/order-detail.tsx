import Image from 'next/image'

import { formatPrice } from '@/lib/utils/format-price'

import type { OrderDetail as OrderDetailType } from '../queries'
import { OrderStatusBadge } from './order-status-badge'
import { OrderTimeline } from './order-timeline'

interface OrderDetailProps {
  order: OrderDetailType
  showInternalNotes?: boolean
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

const OPERATOR_LABELS: Record<string, string> = {
  AIRTEL_MONEY: 'Airtel Money',
  MOOV_MONEY: 'Moov Money',
  VISA_MASTERCARD: 'Carte bancaire',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  success: 'Réussi',
  failed: 'Échoué',
  cancelled: 'Annulé',
}

export function OrderDetail({ order, showInternalNotes = false }: OrderDetailProps) {
  return (
    <div className="space-y-6">
      <header className="bg-card border-border flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4 shadow-sm sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{order.orderNumber}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Passée le {dateFormatter.format(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} className="text-sm" />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="bg-card border-border rounded-lg border p-4 shadow-sm sm:p-6">
            <h2 className="text-sm font-semibold">Articles</h2>
            <ul className="divide-border mt-3 divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <div className="bg-muted border-border relative h-14 w-14 shrink-0 overflow-hidden rounded border">
                    {item.productImage && (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium">{item.productName}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium">{formatPrice(item.subtotal)}</p>
                </li>
              ))}
            </ul>

            <dl className="border-border mt-4 space-y-1.5 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sous-total</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Livraison{order.delivery ? ` (${order.delivery.name})` : ''}
                </dt>
                <dd>{order.deliveryFee === 0 ? 'Gratuit' : formatPrice(order.deliveryFee)}</dd>
              </div>
              <div className="border-border flex justify-between border-t pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="bg-card border-border rounded-lg border p-4 shadow-sm sm:p-6">
            <h2 className="text-sm font-semibold">Adresse de livraison</h2>
            <address className="text-foreground mt-2 text-sm not-italic">
              <p className="font-medium">{order.deliveryAddress.fullName}</p>
              <p>{order.deliveryAddress.phone}</p>
              <p>{order.deliveryAddress.address}</p>
              <p>{order.deliveryAddress.city}</p>
            </address>
          </section>

          {order.payment && (
            <section className="bg-card border-border rounded-lg border p-4 shadow-sm sm:p-6">
              <h2 className="text-sm font-semibold">Paiement</h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground text-xs">Moyen</dt>
                  <dd className="mt-0.5 font-medium">
                    {OPERATOR_LABELS[order.payment.operator] ?? order.payment.operator}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Statut</dt>
                  <dd className="mt-0.5 font-medium">
                    {PAYMENT_STATUS_LABELS[order.payment.status] ?? order.payment.status}
                  </dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <dt className="text-muted-foreground text-xs">Référence</dt>
                  <dd className="mt-0.5 font-mono text-xs break-all">
                    {order.payment.merchantReferenceId}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          {showInternalNotes && order.notes && (
            <section className="bg-card border-border rounded-lg border p-4 shadow-sm sm:p-6">
              <h2 className="text-sm font-semibold">Notes</h2>
              <pre className="text-foreground mt-2 font-sans text-sm break-words whitespace-pre-wrap">
                {order.notes}
              </pre>
            </section>
          )}
        </div>

        <aside>
          <OrderTimeline status={order.status} />
        </aside>
      </div>
    </div>
  )
}
