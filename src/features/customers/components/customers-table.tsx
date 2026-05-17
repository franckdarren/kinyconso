import Link from 'next/link'

import { formatPrice } from '@/lib/utils/format-price'

import type { CustomerListRow } from '../queries'

interface CustomersTableProps {
  rows: CustomerListRow[]
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' })

export function CustomersTable({ rows }: CustomersTableProps) {
  if (rows.length === 0) {
    return (
      <div className="bg-card border-border rounded-lg border p-8 text-center shadow-sm">
        <p className="text-muted-foreground text-sm">Aucun client à afficher.</p>
      </div>
    )
  }

  return (
    <div className="bg-card border-border overflow-hidden rounded-lg border shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-muted-foreground text-xs tracking-wide uppercase">
          <tr>
            <th scope="col" className="px-4 py-2.5 text-left font-medium">
              Client
            </th>
            <th scope="col" className="hidden px-4 py-2.5 text-left font-medium md:table-cell">
              Téléphone
            </th>
            <th scope="col" className="hidden px-4 py-2.5 text-left font-medium lg:table-cell">
              Ville
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              Commandes
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              Dépensé
            </th>
            <th scope="col" className="hidden px-4 py-2.5 text-right font-medium sm:table-cell">
              Dernière commande
            </th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-muted/40">
              <td className="px-4 py-3">
                <Link href={`/admin/clients/${row.id}`} className="font-medium hover:underline">
                  {row.fullName ?? '—'}
                </Link>
                <p className="text-muted-foreground text-xs">
                  Inscrit le {dateFormatter.format(row.createdAt)}
                </p>
              </td>
              <td className="hidden px-4 py-3 md:table-cell">{row.phone ?? '—'}</td>
              <td className="hidden px-4 py-3 lg:table-cell">{row.city ?? '—'}</td>
              <td className="px-4 py-3 text-right tabular-nums">{row.ordersCount}</td>
              <td className="px-4 py-3 text-right font-medium tabular-nums">
                {formatPrice(row.totalSpent)}
              </td>
              <td className="text-muted-foreground hidden px-4 py-3 text-right text-xs sm:table-cell">
                {row.lastOrderAt ? dateFormatter.format(row.lastOrderAt) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
