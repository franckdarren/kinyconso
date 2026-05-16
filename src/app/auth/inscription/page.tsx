import type { Metadata } from 'next'
import Link from 'next/link'

import { SignUpForm } from './sign-up-form'

export const metadata: Metadata = {
  title: 'Inscription',
  description: 'Créez votre compte KinyConso pour commander en quelques clics',
}

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Créer un compte</h1>
        <p className="text-muted-foreground text-sm">
          Inscrivez-vous pour commander et suivre vos livraisons
        </p>
      </div>

      <SignUpForm />

      <p className="text-muted-foreground text-center text-sm">
        Déjà inscrit ?{' '}
        <Link
          href="/auth/connexion"
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  )
}
