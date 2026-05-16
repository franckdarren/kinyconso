import type { Metadata } from 'next'

import { UpdatePasswordForm } from './update-password-form'

export const metadata: Metadata = {
  title: 'Réinitialisation du mot de passe',
  description: 'Définissez un nouveau mot de passe pour votre compte KinyConso',
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Nouveau mot de passe</h1>
        <p className="text-muted-foreground text-sm">
          Saisissez votre nouveau mot de passe pour finaliser la réinitialisation
        </p>
      </div>

      <UpdatePasswordForm />
    </div>
  )
}
