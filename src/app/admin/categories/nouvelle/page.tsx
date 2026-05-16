import type { Metadata } from 'next'

import { CategoryForm } from '@/features/categories/components/category-form'
import { getCategories } from '@/features/categories/queries'

export const metadata: Metadata = {
  title: 'Nouvelle catégorie',
}

export const dynamic = 'force-dynamic'

export default async function NewCategoryPage() {
  const parents = await getCategories()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Nouvelle catégorie</h1>
        <p className="text-muted-foreground text-sm">
          Renseignez les informations puis cliquez sur « Créer la catégorie ».
        </p>
      </header>

      <CategoryForm parents={parents.map((p) => ({ id: p.id, name: p.name }))} />
    </div>
  )
}
