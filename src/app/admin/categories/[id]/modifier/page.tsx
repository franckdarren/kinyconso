import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CategoryForm } from '@/features/categories/components/category-form'
import { getCategories, getCategoryById } from '@/features/categories/queries'

export const metadata: Metadata = {
  title: 'Modifier la catégorie',
}

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params
  const [category, allCategories] = await Promise.all([getCategoryById(id), getCategories()])

  if (!category) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Modifier la catégorie</h1>
        <p className="text-muted-foreground text-sm">{category.name}</p>
      </header>

      <CategoryForm
        parents={allCategories.map((p) => ({ id: p.id, name: p.name }))}
        initial={category}
      />
    </div>
  )
}
