'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'

interface FilterBarProps {
  categories: { id: string; name: string }[]
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'name_asc', label: 'Nom (A → Z)' },
] as const

export function ProductsFilterBar({ categories }: FilterBarProps) {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value && value.length > 0) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    next.delete('page')
    startTransition(() => {
      router.push(`/produits?${next.toString()}`)
    })
  }

  return (
    <div className="bg-card border-border flex flex-col gap-3 rounded-lg border p-4 shadow-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          updateParam('search', String(fd.get('search') ?? '').trim())
        }}
        className="relative"
      >
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          name="search"
          defaultValue={params.get('search') ?? ''}
          placeholder="Rechercher un produit…"
          className="pl-9"
          disabled={isPending}
        />
      </form>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs font-medium">Catégorie</span>
          <select
            value={params.get('categoryId') ?? ''}
            onChange={(e) => updateParam('categoryId', e.target.value)}
            disabled={isPending}
            className="border-input bg-background h-9 rounded-md border px-2 text-sm"
          >
            <option value="">Toutes</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs font-medium">Prix max (FCFA)</span>
          <Input
            type="number"
            min={0}
            step={500}
            defaultValue={params.get('maxPrice') ?? ''}
            placeholder="Sans limite"
            onBlur={(e) => updateParam('maxPrice', e.target.value)}
            disabled={isPending}
            className="h-9"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs font-medium">Trier par</span>
          <select
            value={params.get('sort') ?? 'recent'}
            onChange={(e) => updateParam('sort', e.target.value === 'recent' ? '' : e.target.value)}
            disabled={isPending}
            className="border-input bg-background h-9 rounded-md border px-2 text-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
