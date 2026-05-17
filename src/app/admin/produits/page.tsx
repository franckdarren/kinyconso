import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Pagination } from '@/features/products/components/pagination'
import { ProductRowActions } from '@/features/products/components/product-row-actions'
import { getCategories } from '@/features/categories/queries'
import { getProducts } from '@/features/products/queries'
import { formatPrice } from '@/lib/utils/format-price'

export const metadata: Metadata = {
  title: 'Produits',
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1

  const [list, allCategories] = await Promise.all([
    getProducts({
      includeInactive: true,
      includeDeleted: false,
      page,
      pageSize: 20,
      search: sp.search,
      categoryId: sp.categoryId,
    }),
    getCategories(),
  ])

  const categoryName = (id: string) => allCategories.find((c) => c.id === id)?.name ?? '—'

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produits</h1>
          <p className="text-muted-foreground text-sm">{list.total} produit(s) au total</p>
        </div>
        <Button asChild>
          <Link href="/admin/produits/nouveau" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau produit
          </Link>
        </Button>
      </header>

      {list.rows.length === 0 ? (
        <div className="border-border bg-muted/30 rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">
            Aucun produit. Cliquez sur « Nouveau produit » pour démarrer.
          </p>
        </div>
      ) : (
        <>
          <div className="border-border overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-left">
                <tr>
                  <th className="w-16 px-4 py-3"></th>
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Catégorie</th>
                  <th className="px-4 py-3 font-medium">Prix</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="w-44 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {list.rows.map((p) => (
                  <tr key={p.id} className="border-border border-t">
                    <td className="px-4 py-2">
                      <div className="bg-muted relative h-10 w-10 overflow-hidden rounded">
                        {p.images?.[0] ? (
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    <td className="text-muted-foreground px-4 py-2">
                      {categoryName(p.categoryId)}
                    </td>
                    <td className="px-4 py-2">{formatPrice(p.price)}</td>
                    <td className="px-4 py-2">
                      <span className={p.stockQuantity > 0 ? '' : 'text-destructive font-medium'}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          p.isActive
                            ? 'inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-muted text-muted-foreground inline-flex rounded-full px-2 py-0.5 text-xs font-medium'
                        }
                      >
                        {p.isActive ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <ProductRowActions
                        id={p.id}
                        name={p.name}
                        isActive={p.isActive}
                        isFeatured={p.isFeatured}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            basePath="/admin/produits"
            searchParams={sp}
            page={list.page}
            totalPages={list.totalPages}
          />
        </>
      )}
    </div>
  )
}
