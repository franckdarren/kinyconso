import type { Metadata } from 'next'

import { Pagination } from '@/features/products/components/pagination'
import { ProductGrid } from '@/features/products/components/product-grid'
import { ProductsFilterBar } from '@/features/products/components/products-filter-bar'
import { getActiveCategories } from '@/features/categories/queries'
import { getProducts } from '@/features/products/queries'

export const metadata: Metadata = {
  title: 'Tous les produits',
  description: 'Catalogue complet KinyConso : alimentation, boissons, hygiène, maison et plus.',
  alternates: { canonical: '/produits' },
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export default async function ProductsCatalogPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = parseNumber(sp.page) ?? 1
  const sort =
    sp.sort === 'price_asc' || sp.sort === 'price_desc' || sp.sort === 'name_asc'
      ? sp.sort
      : 'recent'

  const [list, categories] = await Promise.all([
    getProducts({
      page,
      pageSize: 24,
      search: sp.search,
      categoryId: sp.categoryId,
      minPrice: parseNumber(sp.minPrice),
      maxPrice: parseNumber(sp.maxPrice),
      sort,
    }),
    getActiveCategories(),
  ])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
        <p className="text-muted-foreground mt-1 text-sm">{list.total} produit(s) disponible(s)</p>
      </header>

      <div className="mb-6">
        <ProductsFilterBar categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
      </div>

      <ProductGrid products={list.rows} prioritizeFirst />

      <Pagination
        basePath="/produits"
        searchParams={sp}
        page={list.page}
        totalPages={list.totalPages}
      />
    </div>
  )
}
