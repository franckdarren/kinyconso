'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type Status = 'loading' | 'authenticated' | 'unauthenticated'

interface UseUserResult {
  user: User | null
  status: Status
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    let cancelled = false

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return
      setUser(data.user)
      setStatus(data.user ? 'authenticated' : 'unauthenticated')
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setStatus(session?.user ? 'authenticated' : 'unauthenticated')
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return { user, status }
}
