'use server'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

import { STORAGE_BUCKETS, type StorageBucket } from '../constants'

interface DeleteFilesInput {
  bucket: StorageBucket
  paths: string[]
}

export async function deleteFiles(input: DeleteFilesInput): Promise<ActionResult<void>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  if (input.bucket !== STORAGE_BUCKETS.avatars && user.role !== 'admin') {
    return { success: false, error: 'Réservé aux administrateurs' }
  }

  // Pour les avatars : un user ne peut supprimer que ses propres fichiers
  if (input.bucket === STORAGE_BUCKETS.avatars && user.role !== 'admin') {
    const allowed = input.paths.every((p) => p.startsWith(`${user.id}/`))
    if (!allowed) {
      return { success: false, error: 'Vous ne pouvez supprimer que vos propres fichiers' }
    }
  }

  if (input.paths.length === 0) {
    return { success: true, data: undefined }
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.storage.from(input.bucket).remove(input.paths)

  if (error) {
    return { success: false, error: `Échec de la suppression : ${error.message}` }
  }

  return { success: true, data: undefined }
}
