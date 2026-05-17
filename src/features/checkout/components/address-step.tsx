'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { addressStepSchema, type AddressStepInput } from '../schemas/checkout.schema'
import { useCheckoutStore } from '../stores/checkout.store'

interface AddressStepProps {
  defaults?: Partial<AddressStepInput>
}

export function AddressStep({ defaults }: AddressStepProps) {
  const setAddress = useCheckoutStore((s) => s.setAddress)
  const goNext = useCheckoutStore((s) => s.goNext)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressStepInput>({
    resolver: zodResolver(addressStepSchema),
    defaultValues: {
      fullName: defaults?.fullName ?? '',
      phone: defaults?.phone ?? '',
      address: defaults?.address ?? '',
      city: defaults?.city ?? '',
      notes: defaults?.notes ?? '',
    },
  })

  const onSubmit = handleSubmit((values) => {
    setAddress({
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      notes: values.notes?.trim() || undefined,
    })
    goNext()
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Nom complet *</Label>
          <Input id="fullName" autoComplete="name" className="h-11" {...register('fullName')} />
          {errors.fullName && <p className="text-destructive text-sm">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+241 …"
            className="h-11"
            {...register('phone')}
          />
          {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ville *</Label>
          <Input
            id="city"
            autoComplete="address-level2"
            placeholder="Libreville"
            className="h-11"
            {...register('city')}
          />
          {errors.city && <p className="text-destructive text-sm">{errors.city.message}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Adresse de livraison *</Label>
          <textarea
            id="address"
            rows={2}
            autoComplete="street-address"
            placeholder="Quartier, repère, numéro…"
            className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm"
            {...register('address')}
          />
          {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Note pour le livreur (optionnel)</Label>
          <textarea
            id="notes"
            rows={2}
            className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm"
            {...register('notes')}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" className="min-h-11 gap-2" disabled={isSubmitting}>
          Continuer
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
