import type { StorageBucket } from '../constants'

/**
 * Convertit une URL publique Supabase Storage en chemin relatif au bucket.
 * Ex: https://xxx.supabase.co/storage/v1/object/public/products/abc/img.webp
 *  → "abc/img.webp"
 */
export function publicUrlToPath(publicUrl: string, bucket: StorageBucket): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return publicUrl.slice(idx + marker.length)
}
