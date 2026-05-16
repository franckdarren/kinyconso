export const STORAGE_BUCKETS = {
  products: 'products',
  categories: 'categories',
  avatars: 'avatars',
} as const

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS]

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 Mo
export const MAX_FILE_SIZE_MB = 5

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const ACCEPTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const

export const COMPRESSION_DEFAULTS = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.85,
  outputType: 'image/webp' as const,
} satisfies CompressionOptions

export type CompressionOptions = {
  maxWidth: number
  maxHeight: number
  quality: number
  outputType: 'image/webp' | 'image/jpeg'
}
