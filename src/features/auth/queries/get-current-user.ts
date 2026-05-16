import 'server-only'

import { cache } from 'react'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { UserRole } from '@/db/schema/enums'

export type CurrentUserProfile = {
  id: string
  email: string | null
  fullName: string | null
  phone: string | null
  role: UserRole
}

/**
 * Renvoie l'utilisateur connecté + son profil (rôle, nom...).
 * Mis en cache à l'échelle d'une requête React.
 * Renvoie null si non connecté.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUserProfile | null> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, phone, role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: profile?.full_name ?? null,
    phone: profile?.phone ?? null,
    role: (profile?.role as UserRole | undefined) ?? 'customer',
  }
})

export async function requireAdmin(): Promise<CurrentUserProfile> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    throw new Error('UNAUTHORIZED')
  }
  return user
}
