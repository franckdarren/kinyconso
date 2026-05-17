'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CustomersSearch() {
  const router = useRouter()
  const search = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function update(value: string) {
    const next = new URLSearchParams(search.toString())
    const trimmed = value.trim()
    if (trimmed) {
      next.set('search', trimmed)
    } else {
      next.delete('search')
    }
    next.delete('page')
    startTransition(() => {
      router.replace(`/admin/clients?${next.toString()}`)
    })
  }

  return (
    <div
      className={`bg-card border-border rounded-lg border p-3 sm:p-4 ${
        isPending ? 'opacity-70' : ''
      }`}
    >
      <div className="space-y-1.5">
        <Label htmlFor="search">Rechercher un client</Label>
        <Input
          id="search"
          placeholder="Nom ou numéro de téléphone…"
          defaultValue={search.get('search') ?? ''}
          onBlur={(event) => update(event.currentTarget.value)}
        />
      </div>
    </div>
  )
}
