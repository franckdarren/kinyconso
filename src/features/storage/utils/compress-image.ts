'use client'

import { COMPRESSION_DEFAULTS, type CompressionOptions } from '../constants'

/**
 * Compresse une image côté client via Canvas API.
 * - Redimensionne en conservant le ratio si l'image dépasse maxWidth/maxHeight
 * - Convertit en WebP (fallback JPEG si WebP non supporté en encode)
 */
export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {},
): Promise<File> {
  const opts: CompressionOptions = { ...COMPRESSION_DEFAULTS, ...options }

  const dataUrl = await readAsDataUrl(file)
  const img = await loadImage(dataUrl)

  const { width, height } = scaleSize(img.width, img.height, opts.maxWidth, opts.maxHeight)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Impossible d’initialiser le contexte canvas')
  }
  ctx.drawImage(img, 0, 0, width, height)

  const supportsWebp = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  const outputType = supportsWebp ? opts.outputType : 'image/jpeg'
  const extension = outputType === 'image/webp' ? 'webp' : 'jpg'

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outputType, opts.quality),
  )
  if (!blob) {
    throw new Error('La compression a échoué')
  }

  const baseName = file.name.replace(/\.[^.]+$/, '')
  return new File([blob], `${baseName}.${extension}`, { type: outputType })
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Chargement de l’image impossible'))
    img.src = src
  })
}

function scaleSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) return { width, height }

  const ratio = Math.min(maxWidth / width, maxHeight / height)
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  }
}
