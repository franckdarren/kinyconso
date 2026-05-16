import type { Metadata } from 'next'
import Link from 'next/link'

import { SignInForm } from './sign-in-form'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte KinyConso',
}

interface PageProps {
  searchParams: Promise<{ redirectTo?: string; error?: string }>
}

export default async function SignInPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
        <p className="text-muted-foreground text-sm">
          Accédez à votre compte pour suivre vos commandes
        </p>
      </div>

      <SignInForm redirectTo={params.redirectTo ?? '/'} initialError={params.error} />

      <div className="text-muted-foreground space-y-2 text-center text-sm">
        <p>
          <Link
            href="/auth/mot-de-passe-oublie"
            className="hover:text-foreground font-medium underline-offset-4 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </p>
        <p>
          Pas encore de compte ?{' '}
          <Link
            href="/auth/inscription"
            className="text-primary font-medium underline-offset-4 hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
