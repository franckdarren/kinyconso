'use server'

import { randomUUID } from 'node:crypto'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  STORAGE_BUCKETS,
  type StorageBucket,
} from '../constants'

interface UploadFileInput {
  bucket: StorageBucket
  file: File
  /** Sous-dossier optionnel à l'intérieur du bucket (ex: productId, userId) */
  folder?: string
}

interface UploadResult {
  path: string
  publicUrl: string
}

/**
 * Upload un fichier dans un bucket Supabase Storage.
 * - `products` / `categories` : admin requis
 * - `avatars` : user connecté requis (uploadé dans son propre dossier)
 */
export async function uploadFile(input: UploadFileInput): Promise<ActionResult<UploadResult>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  if (input.bucket !== STORAGE_BUCKETS.avatars && user.role !== 'admin') {
    return { success: false, error: 'Réservé aux administrateurs' }
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(input.file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return { success: false, error: 'Format de fichier non supporté' }
  }
  if (input.file.size > MAX_FILE_SIZE_BYTES) {
    return { success: false, error: `Fichier trop volumineux (max ${MAX_FILE_SIZE_MB} Mo)` }
  }

  const extension = input.file.name.split('.').pop()?.toLowerCase() ?? 'webp'
  const filename = `${randomUUID()}.${extension}`

  const folder =
    input.bucket === STORAGE_BUCKETS.avatars ? (input.folder ?? user.id) : (input.folder ?? '')
  const path = folder ? `${folder}/${filename}` : filename

  const supabase = createSupabaseAdminClient()
  const buffer = Buffer.from(await input.file.arrayBuffer())

  const { error } = await supabase.storage.from(input.bucket).upload(path, buffer, {
    contentType: input.file.type,
    upsert: false,
    cacheControl: '31536000',
  })

  if (error) {
    return { success: false, error: `Échec de l’upload : ${error.message}` }
  }

  const { data } = supabase.storage.from(input.bucket).getPublicUrl(path)

  return {
    success: true,
    data: { path, publicUrl: data.publicUrl },
  }
}
