'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DeliveryOption } from '@/db/schema'

import { createDeliveryOption, updateDeliveryOption } from '../actions'
import {
  createDeliveryOptionSchema,
  updateDeliveryOptionSchema,
  type CreateDeliveryOptionInput,
  type UpdateDeliveryOptionInput,
} from '../schemas/delivery.schema'

interface DeliveryFormProps {
  initial?: DeliveryOption
}

export function DeliveryForm({ initial }: DeliveryFormProps) {
  const router = useRouter()
  const isEdit = !!initial
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  type FormValues = CreateDeliveryOptionInput & { id?: string }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? updateDeliveryOptionSchema : createDeliveryOptionSchema),
    defaultValues: {
      ...(isEdit ? { id: initial?.id } : {}),
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      price: initial?.price ?? 0,
      estimatedDays: initial?.estimatedDays ?? null,
      isActive: initial?.isActive ?? true,
      sortOrder: initial?.sortOrder ?? 0,
    },
  })

  const onSubmit = handleSubmit((values) => {
    setServerError(null)

    startTransition(async () => {
      const result = isEdit
        ? await updateDeliveryOption({
            ...(values as UpdateDeliveryOptionInput),
            id: initial!.id,
          })
        : await createDeliveryOption(values)

      if (!result.success) {
        setServerError(result.error)
        toast.error(result.error)
        return
      }
      toast.success(isEdit ? 'Option de livraison mise à jour' : 'Option de livraison créée')
      router.push('/admin/livraisons')
      router.refresh()
    })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nom *</Label>
          <Input
            id="name"
            placeholder="Ex. Livraison standard Libreville"
            {...register('name')}
            disabled={isPending}
          />
          {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={3}
            placeholder="Détails optionnels (zone couverte, conditions...)"
            className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm"
            {...register('description')}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Prix (FCFA) *</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step={100}
            {...register('price', { valueAsNumber: true })}
            disabled={isPending}
          />
          {errors.price && <p className="text-destructive text-sm">{errors.price.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedDays">Délai estimé (jours)</Label>
          <Input
            id="estimatedDays"
            type="number"
            min={0}
            placeholder="Ex. 2"
            {...register('estimatedDays', {
              setValueAs: (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
            })}
            disabled={isPending}
          />
          {errors.estimatedDays && (
            <p className="text-destructive text-sm">{errors.estimatedDays.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Ordre d’affichage</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            {...register('sortOrder', { valueAsNumber: true })}
            disabled={isPending}
          />
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="isActive"
            type="checkbox"
            className="border-input h-4 w-4 rounded"
            {...register('isActive')}
            disabled={isPending}
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Option active (sélectionnable au checkout)
          </Label>
        </div>
      </div>

      {serverError && (
        <p className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{serverError}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Enregistrer' : 'Créer l’option'}
        </Button>
      </div>
    </form>
  )
}
