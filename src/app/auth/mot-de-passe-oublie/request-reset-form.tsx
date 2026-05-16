'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { CheckCircle2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset } from '@/features/auth/actions'
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from '@/features/auth/schemas/auth.schema'

export function RequestResetForm() {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit((values) => {
    setServerError(null)
    startTransition(async () => {
      const result = await requestPasswordReset(values)
      if (!result.success) {
        setServerError(result.error)
        toast.error(result.error)
        return
      }
      setSent(true)
      toast.success('Email envoyé')
    })
  })

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="text-primary mx-auto h-10 w-10" />
        <h2 className="text-lg font-semibold">Email envoyé</h2>
        <p className="text-muted-foreground text-sm">
          Si un compte est associé à cette adresse, vous recevrez un lien pour réinitialiser votre
          mot de passe.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          disabled={isPending}
          {...register('email')}
        />
        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
      </div>

      {serverError && (
        <p className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{serverError}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Envoyer le lien
      </Button>
    </form>
  )
}
