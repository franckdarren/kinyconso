import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Pagination } from '@/features/products/components/pagination'
import { ProductGrid } from '@/features/products/components/product-grid'
import { getCategoryBySlug } from '@/features/categories/queries'
import { getProducts } from '@/features/products/queries'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug).catch(() => null)
  if (!category) return { title: 'Catégorie introuvable' }

  return {
    title: category.name,
    description: category.description ?? `Découvrez les produits de la catégorie ${category.name}`,
    alternates: { canonical: `/categories/${category.slug}` },
  }
}

export default async function CategoryDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const category = await getCategoryBySlug(slug).catch(() => null)

  if (!category || !category.isActive) notFound()

  const page = Number(sp.page) > 0 ? Number(sp.page) : 1
  const list = await getProducts({
    categoryId: category.id,
    page,
    pageSize: 24,
    sort: sp.sort === 'price_asc' || sp.sort === 'price_desc' ? sp.sort : 'recent',
  })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <nav className="text-muted-foreground mb-4 text-sm">
        <Link href="/" className="hover:text-foreground">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <Link href="/categories" className="hover:text-foreground">
          Catégories
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-2 text-sm">{category.description}</p>
        )}
        <p className="text-muted-foreground mt-1 text-xs">
          {list.total} produit(s) dans cette catégorie
        </p>
      </header>

      <ProductGrid
        products={list.rows}
        emptyLabel="Aucun produit dans cette catégorie pour le moment."
        prioritizeFirst
      />

      <Pagination
        basePath={`/categories/${category.slug}`}
        searchParams={sp}
        page={list.page}
        totalPages={list.totalPages}
      />
    </div>
  )
}
