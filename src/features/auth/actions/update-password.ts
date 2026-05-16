'use server'

import { revalidatePath } from 'next/cache'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/actions'

import { updatePasswordSchema, type UpdatePasswordInput } from '../schemas/auth.schema'
import { translateAuthError } from '../utils/translate-error'

export async function updatePassword(input: UpdatePasswordInput): Promise<ActionResult<void>> {
  const parsed = updatePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Champs invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) {
    return { success: false, error: translateAuthError(error.message) }
  }

  revalidatePath('/', 'layout')
  return { success: true, data: undefined }
}
