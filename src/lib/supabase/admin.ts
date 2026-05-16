import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

/**
 * Client Supabase avec clé service_role.
 * Bypass la RLS — réservé aux routes API / actions privilégiées.
 * Ne JAMAIS exposer côté client.
 */
export function createSupabaseAdminClient() {
  if (cached) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL est manquant.')
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY est manquant.')

  cached = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return cached
}
