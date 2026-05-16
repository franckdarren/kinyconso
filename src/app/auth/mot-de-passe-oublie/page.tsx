import type { Metadata } from 'next'
import Link from 'next/link'

import { RequestResetForm } from './request-reset-form'

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
  description: 'Réinitialisez votre mot de passe KinyConso',
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Mot de passe oublié</h1>
        <p className="text-muted-foreground text-sm">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <RequestResetForm />

      <p className="text-muted-foreground text-center text-sm">
        <Link
          href="/auth/connexion"
          className="hover:text-foreground font-medium underline-offset-4 hover:underline"
        >
          Retour à la connexion
        </Link>
      </p>
    </div>
  )
}
