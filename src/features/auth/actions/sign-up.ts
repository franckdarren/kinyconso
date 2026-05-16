'use server'

import { revalidatePath } from 'next/cache'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { siteConfig } from '@/config/site'
import type { ActionResult } from '@/types/actions'

import { signUpSchema, type SignUpInput } from '../schemas/auth.schema'
import { translateAuthError } from '../utils/translate-error'

export async function signUp(
  input: SignUpInput,
): Promise<ActionResult<{ needsEmailConfirmation: boolean }>> {
  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Champs invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
      },
      emailRedirectTo: `${siteConfig.url}/auth/callback`,
    },
  })

  if (error) {
    return { success: false, error: translateAuthError(error.message) }
  }

  revalidatePath('/', 'layout')

  const needsEmailConfirmation = !data.session
  return { success: true, data: { needsEmailConfirmation } }
}
