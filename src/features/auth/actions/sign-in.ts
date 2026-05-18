'use server'

import { revalidatePath } from 'next/cache'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/actions'

import { signInSchema, type SignInInput } from '../schemas/auth.schema'
import { translateAuthError } from '../utils/translate-error'

export async function signIn(input: SignInInput): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = signInSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Champs invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createSupabaseServerClient()
  const { error, data } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: translateAuthError(error.message) }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  revalidatePath('/', 'layout')

  const redirectTo = profile?.role === 'admin' ? '/admin' : '/'
  return { success: true, data: { redirectTo } }
}
