import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getCategoryBySlug } from '@/features/categories/queries'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
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

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug).catch(() => null)

  if (!category || !category.isActive) notFound()

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
      </header>

      <div className="border-border bg-muted/30 rounded-lg border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">
          La liste des produits de cette catégorie sera disponible en Phase 7.
        </p>
      </div>
    </div>
  )
}
