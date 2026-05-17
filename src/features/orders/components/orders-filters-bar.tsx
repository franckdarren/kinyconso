'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { OrderStatus } from '@/db/schema/enums'

import { STATUS_LABELS } from '../state-machine'

const STATUSES: (OrderStatus | 'all')[] = [
  'all',
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]

export function OrdersFiltersBar() {
  const router = useRouter()
  const search = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(search.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    // Reset page sur changement de filtre
    if (!('page' in patch)) next.delete('page')
    startTransition(() => {
      router.replace(`/admin/commandes?${next.toString()}`)
    })
  }

  return (
    <div
      className={`bg-card border-border grid gap-3 rounded-lg border p-3 sm:grid-cols-4 sm:p-4 ${
        isPending ? 'opacity-70' : ''
      }`}
    >
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="search">Recherche</Label>
        <Input
          id="search"
          placeholder="Numéro de commande, nom client…"
          defaultValue={search.get('search') ?? ''}
          onBlur={(event) => update({ search: event.currentTarget.value.trim() || null })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">Statut</Label>
        <select
          id="status"
          className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm"
          defaultValue={search.get('status') ?? 'all'}
          onChange={(event) =>
            update({
              status: event.currentTarget.value === 'all' ? null : event.currentTarget.value,
            })
          }
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'Tous' : STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="from">Depuis</Label>
        <Input
          id="from"
          type="date"
          defaultValue={search.get('from') ?? ''}
          onChange={(event) => update({ from: event.currentTarget.value || null })}
        />
      </div>
    </div>
  )
}
