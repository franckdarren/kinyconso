import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CategoryRowActions } from '@/features/categories/components/category-row-actions'
import { getCategories } from '@/features/categories/queries'

export const metadata: Metadata = {
  title: 'Catégories',
}

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const categories = await getCategories()
  const byId = new Map(categories.map((c) => [c.id, c.name] as const))

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Catégories</h1>
          <p className="text-muted-foreground text-sm">{categories.length} catégorie(s) au total</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/nouvelle" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle catégorie
          </Link>
        </Button>
      </header>

      {categories.length === 0 ? (
        <div className="border-border bg-muted/30 rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">
            Aucune catégorie. Commencez par en créer une.
          </p>
        </div>
      ) : (
        <div className="border-border overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left">
              <tr>
                <th className="w-16 px-4 py-3"></th>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Parent</th>
                <th className="px-4 py-3 font-medium">Ordre</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="w-32 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-border border-t">
                  <td className="px-4 py-2">
                    <div className="bg-muted relative h-10 w-10 overflow-hidden rounded">
                      {cat.imageUrl ? (
                        <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-medium">{cat.name}</td>
                  <td className="text-muted-foreground px-4 py-2 font-mono text-xs">{cat.slug}</td>
                  <td className="text-muted-foreground px-4 py-2">
                    {cat.parentId ? (byId.get(cat.parentId) ?? '—') : '—'}
                  </td>
                  <td className="px-4 py-2">{cat.sortOrder}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        cat.isActive
                          ? 'bg-accent text-accent-foreground inline-flex rounded-full px-2 py-0.5 text-xs font-medium'
                          : 'bg-muted text-muted-foreground inline-flex rounded-full px-2 py-0.5 text-xs font-medium'
                      }
                    >
                      {cat.isActive ? 'Active' : 'Désactivée'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <CategoryRowActions id={cat.id} name={cat.name} isActive={cat.isActive} />
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
