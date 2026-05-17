'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Pencil, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { softDeleteProduct, toggleProductActive, toggleProductFeatured } from '../actions'

interface ProductRowActionsProps {
  id: string
  name: string
  isActive: boolean
  isFeatured: boolean
}

export function ProductRowActions({ id, name, isActive, isFeatured }: ProductRowActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const action = (fn: () => Promise<{ success: boolean; error?: string }>, successMsg: string) => {
    startTransition(async () => {
      const result = await fn()
      if (!result.success) {
        toast.error(result.error ?? 'Erreur')
        return
      }
      toast.success(successMsg)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        aria-label={isFeatured ? 'Retirer de la vedette' : 'Mettre en vedette'}
        onClick={() =>
          action(
            () => toggleProductFeatured(id, !isFeatured),
            isFeatured ? 'Retiré de la vedette' : 'Mis en vedette',
          )
        }
      >
        <Star
          className={
            isFeatured ? 'text-secondary fill-secondary h-4 w-4' : 'text-muted-foreground h-4 w-4'
          }
        />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        aria-label={isActive ? 'Désactiver' : 'Activer'}
        onClick={() =>
          action(
            () => toggleProductActive(id, !isActive),
            isActive ? 'Produit désactivé' : 'Produit activé',
          )
        }
      >
        {isActive ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="text-muted-foreground h-4 w-4" />
        )}
      </Button>

      <Button asChild variant="ghost" size="icon" aria-label="Modifier">
        <Link href={`/admin/produits/${id}/modifier`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        aria-label="Supprimer"
        onClick={() => {
          if (!window.confirm(`Supprimer le produit « ${name} » ?`)) return
          action(() => softDeleteProduct(id), 'Produit supprimé')
        }}
      >
        <Trash2 className="text-destructive h-4 w-4" />
      </Button>
    </div>
  )
}
