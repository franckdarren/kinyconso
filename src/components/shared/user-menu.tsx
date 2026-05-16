import Link from 'next/link'
import { LogIn, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/features/auth/queries/get-current-user'
import { signOut } from '@/features/auth/actions'

export async function UserMenu() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <Button asChild variant="ghost" size="sm" aria-label="Se connecter">
        <Link href="/auth/connexion" className="gap-2">
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Connexion</span>
        </Link>
      </Button>
    )
  }

  const displayName = user.fullName ?? user.email ?? 'Mon compte'

  return (
    <div className="flex items-center gap-1">
      {user.role === 'admin' && (
        <Button asChild variant="ghost" size="icon" aria-label="Espace admin">
          <Link href="/admin">
            <ShieldCheck className="h-4 w-4" />
          </Link>
        </Button>
      )}

      <Button asChild variant="ghost" size="sm" aria-label="Mon compte">
        <Link href="/compte" className="gap-2">
          <UserIcon className="h-4 w-4" />
          <span className="hidden max-w-[12ch] truncate sm:inline">{displayName}</span>
        </Link>
      </Button>

      <form action={signOut}>
        <Button type="submit" variant="ghost" size="icon" aria-label="Se déconnecter">
          <LogOut className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
