'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { deleteDeliveryOption, toggleDeliveryOptionActive } from '../actions'

interface DeliveryRowActionsProps {
  id: string
  name: string
  isActive: boolean
}

export function DeliveryRowActions({ id, name, isActive }: DeliveryRowActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleDeliveryOptionActive(id, !isActive)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(isActive ? 'Option désactivée' : 'Option activée')
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!window.confirm(`Supprimer l’option « ${name} » ? Cette action est irréversible.`)) {
      return
    }
    startTransition(async () => {
      const result = await deleteDeliveryOption(id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Option supprimée')
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
        <Link href={`/admin/livraisons/${id}/modifier`}>
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
