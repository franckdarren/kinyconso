import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DeliveryRowActions } from '@/features/delivery/components/delivery-row-actions'
import { getDeliveryOptions } from '@/features/delivery/queries'
import { formatPrice } from '@/lib/utils/format-price'

export const metadata: Metadata = {
  title: 'Livraisons',
}

export const dynamic = 'force-dynamic'

function formatDelay(days: number | null): string {
  if (days === null || days === undefined) return '—'
  if (days === 0) return 'Le jour même'
  if (days === 1) return '1 jour'
  return `${days} jours`
}

export default async function AdminDeliveriesPage() {
  const options = await getDeliveryOptions()

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Options de livraison</h1>
          <p className="text-muted-foreground text-sm">{options.length} option(s) au total</p>
        </div>
        <Button asChild>
          <Link href="/admin/livraisons/nouvelle" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle option
          </Link>
        </Button>
      </header>

      {options.length === 0 ? (
        <div className="border-border bg-muted/30 rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">
            Aucune option de livraison. Commencez par en créer une.
          </p>
        </div>
      ) : (
        <div className="border-border overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Prix</th>
                <th className="px-4 py-3 font-medium">Délai</th>
                <th className="px-4 py-3 font-medium">Ordre</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="w-32 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {options.map((opt) => (
                <tr key={opt.id} className="border-border border-t">
                  <td className="px-4 py-2">
                    <p className="font-medium">{opt.name}</p>
                    {opt.description && (
                      <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                        {opt.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {opt.price === 0 ? (
                      <span className="text-green-700">Gratuit</span>
                    ) : (
                      formatPrice(opt.price)
                    )}
                  </td>
                  <td className="text-muted-foreground px-4 py-2">
                    {formatDelay(opt.estimatedDays)}
                  </td>
                  <td className="px-4 py-2">{opt.sortOrder}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        opt.isActive
                          ? 'inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
                          : 'bg-muted text-muted-foreground inline-flex rounded-full px-2 py-0.5 text-xs font-medium'
                      }
                    >
                      {opt.isActive ? 'Active' : 'Désactivée'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <DeliveryRowActions id={opt.id} name={opt.name} isActive={opt.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
