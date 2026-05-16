'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { deleteCategory, toggleCategoryActive } from '../actions'

interface CategoryRowActionsProps {
  id: string
  name: string
  isActive: boolean
}

export function CategoryRowActions({ id, name, isActive }: CategoryRowActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleCategoryActive(id, !isActive)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(isActive ? 'Catégorie désactivée' : 'Catégorie activée')
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!window.confirm(`Supprimer la catégorie « ${name} » ? Cette action est irréversible.`)) {
      return
    }
    startTransition(async () => {
      const result = await deleteCategory(id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Catégorie supprimée')
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={isActive ? 'Désactiver' : 'Activer'}
      >
        {isActive ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="text-muted-foreground h-4 w-4" />
        )}
      </Button>
      <Button asChild variant="ghost" size="icon" aria-label="Modifier">
        <Link href={`/admin/categories/${id}/modifier`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Supprimer"
      >
        <Trash2 className="text-destructive h-4 w-4" />
      </Button>
    </div>
  )
}
