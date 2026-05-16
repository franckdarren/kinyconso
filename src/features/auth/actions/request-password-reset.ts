'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { siteConfig } from '@/config/site'
import type { ActionResult } from '@/types/actions'

import { requestPasswordResetSchema, type RequestPasswordResetInput } from '../schemas/auth.schema'
import { translateAuthError } from '../utils/translate-error'

export async function requestPasswordReset(
  input: RequestPasswordResetInput,
): Promise<ActionResult<void>> {
  const parsed = requestPasswordResetSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Email invalide',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteConfig.url}/auth/reinitialisation`,
  })

  if (error) {
    return { success: false, error: translateAuthError(error.message) }
  }

  return { success: true, data: undefined }
}
