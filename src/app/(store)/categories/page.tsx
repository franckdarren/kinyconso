import type { Metadata } from 'next'

import { CategoryCard } from '@/features/categories/components/category-card'
import { getActiveCategories } from '@/features/categories/queries'

export const metadata: Metadata = {
  title: 'Toutes les categories',
  description: "Parcourez l'ensemble des categories KinyConso",
  alternates: {
    canonical: '/categories',
    languages: { fr: '/categories' },
  },
  openGraph: {
    title: 'Toutes les categories - KinyConso',
    description: "Parcourez l'ensemble des categories KinyConso",
    type: 'website',
    url: '/categories',
  },
}

export const dynamic = 'force-dynamic'

export default async function CategoriesIndexPage() {
  const categories = await getActiveCategories()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {categories.length} categorie(s) disponible(s)
        </p>
      </header>

      {categories.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Aucune categorie n&apos;est encore disponible.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  )
}
