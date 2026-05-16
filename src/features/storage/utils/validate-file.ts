import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from '../constants'

export function validateImageFile(file: File): { valid: true } | { valid: false; error: string } {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return {
      valid: false,
      error: `Format non supporté. Formats acceptés : ${ACCEPTED_IMAGE_EXTENSIONS.join(', ')}`,
    }
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Le fichier dépasse la taille maximale de ${MAX_FILE_SIZE_MB} Mo`,
    }
  }
  return { valid: true }
}
