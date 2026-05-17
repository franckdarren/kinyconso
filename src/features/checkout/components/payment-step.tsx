'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/features/cart/hooks/use-cart'
import type { PaymentOperator } from '@/db/schema/enums'

import { paymentStepSchema, type PaymentStepInput } from '../schemas/checkout.schema'
import { useCheckoutStore } from '../stores/checkout.store'

import { OperatorSelector } from './operator-selector'

interface PaymentStepProps {
  defaultPhone?: string
}

interface InitiateResponse {
  success?: true
  orderId: string
  orderNumber: string
  merchantReferenceId: string
  pvitTransactionId: string | null
  paymentStatus: 'pending' | 'success' | 'failed' | 'cancelled'
  amount: number
}

export function PaymentStep({ defaultPhone }: PaymentStepProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const { items, clearCart } = useCart()

  const address = useCheckoutStore((s) => s.address)
  const deliveryOptionId = useCheckoutStore((s) => s.deliveryOptionId)
  const payment = useCheckoutStore((s) => s.payment)
  const setPayment = useCheckoutStore((s) => s.setPayment)
  const goBack = useCheckoutStore((s) => s.goBack)
  const setStep = useCheckoutStore((s) => s.setStep)
  const reset = useCheckoutStore((s) => s.reset)

  const [operator, setOperator] = useState<PaymentOperator | null>(payment.operator)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentStepInput>({
    resolver: zodResolver(paymentStepSchema),
    defaultValues: {
      operator: payment.operator ?? undefined,
      customerPhone: payment.customerPhone || defaultPhone || '',
    },
  })

  const onSubmit = handleSubmit((values) => {
    if (!address) {
      toast.error('Adresse manquante')
      setStep('address')
      return
    }
    if (!deliveryOptionId) {
      toast.error('Option de livraison manquante')
      setStep('delivery')
      return
    }
    if (items.length === 0) {
      toast.error('Votre panier est vide')
      router.push('/panier')
      return
    }

    setServerError(null)
    setPayment({ operator: values.operator, customerPhone: values.customerPhone })

    startTransition(async () => {
      try {
        const response = await fetch('/api/pvit/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            deliveryOptionId,
            operator: values.operator,
            customerPhone: values.customerPhone,
            deliveryAddress: {
              fullName: address.fullName,
              phone: address.phone,
              address: address.address,
              city: address.city,
            },
            notes: address.notes,
          }),
        })

        const data = (await response.json().catch(() => null)) as
          | (InitiateResponse & { error?: string })
          | null

        if (!response.ok || !data || !('orderId' in data)) {
          const message =
            data?.error ??
            (response.status === 401
              ? 'Veuillez vous connecter pour finaliser le paiement'
              : 'Échec de l’initiation du paiement')
          setServerError(message)
          toast.error(message)
          if (response.status === 401) {
            router.push('/auth/connexion?redirectTo=/checkout')
          }
          return
        }

        clearCart()
        reset()
        router.push(`/checkout/${data.orderId}/paiement?ref=${data.merchantReferenceId}`)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur réseau'
        setServerError(message)
        toast.error(message)
      }
    })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <OperatorSelector
        value={operator}
        onChange={(op: PaymentOperator) => {
          setOperator(op)
          setValue('operator', op, { shouldValidate: true })
        }}
        disabled={isPending}
      />
      {errors.operator && <p className="text-destructive text-sm">{errors.operator.message}</p>}

      <div className="space-y-2">
        <Label htmlFor="customerPhone">
          {operator === 'VISA_MASTERCARD' ? 'Téléphone (pour le reçu)' : 'Numéro Mobile Money *'}
        </Label>
        <Input
          id="customerPhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+241 …"
          className="h-11"
          disabled={isPending}
          {...register('customerPhone')}
        />
        {errors.customerPhone && (
          <p className="text-destructive text-sm">{errors.customerPhone.message}</p>
        )}
        {operator === 'VISA_MASTERCARD' && (
          <p className="text-muted-foreground text-xs">
            La saisie carte se fera sur la page sécurisée PVIT après validation.
          </p>
        )}
      </div>

      {serverError && (
        <p className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{serverError}</p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="min-h-11 gap-2"
          disabled={isPending}
          onClick={goBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Livraison
        </Button>
        <Button type="submit" size="lg" className="min-h-11 gap-2" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}
          Payer maintenant
        </Button>
      </div>
    </form>
  )
}
