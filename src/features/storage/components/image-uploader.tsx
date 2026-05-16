'use client'

import { useCallback, useId, useState, useTransition } from 'react'
import Image from 'next/image'
import { Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

import { uploadFile, deleteFiles } from '../actions'
import { compressImage } from '../utils/compress-image'
import { publicUrlToPath } from '../utils/public-url'
import { validateImageFile } from '../utils/validate-file'
import { ACCEPTED_IMAGE_EXTENSIONS, MAX_FILE_SIZE_MB, type StorageBucket } from '../constants'

export interface ImageUploaderProps {
  bucket: StorageBucket
  folder?: string
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  /** Désactiver la compression côté client (rare) */
  skipCompression?: boolean
  className?: string
}

export function ImageUploader({
  bucket,
  folder,
  value,
  onChange,
  maxImages = 5,
  skipCompression = false,
  className,
}: ImageUploaderProps) {
  const inputId = useId()
  const [isPending, startTransition] = useTransition()
  const [isDragging, setIsDragging] = useState(false)

  const remaining = maxImages - value.length

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files).slice(0, remaining)
      if (list.length === 0) return

      startTransition(async () => {
        const newUrls: string[] = []
        for (const raw of list) {
          const validation = validateImageFile(raw)
          if (!validation.valid) {
            toast.error(`${raw.name} : ${validation.error}`)
            continue
          }
          try {
            const processed = skipCompression ? raw : await compressImage(raw)
            const result = await uploadFile({ bucket, folder, file: processed })
            if (!result.success) {
              toast.error(`${raw.name} : ${result.error}`)
              continue
            }
            newUrls.push(result.data.publicUrl)
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erreur inconnue'
            toast.error(`${raw.name} : ${msg}`)
          }
        }
        if (newUrls.length > 0) {
          onChange([...value, ...newUrls])
          toast.success(`${newUrls.length} image(s) ajoutée(s)`)
        }
      })
    },
    [bucket, folder, onChange, remaining, skipCompression, value],
  )

  const handleRemove = useCallback(
    (url: string) => {
      const next = value.filter((u) => u !== url)
      onChange(next)
      const path = publicUrlToPath(url, bucket)
      if (path) {
        deleteFiles({ bucket, paths: [path] }).catch(() => {
          /* silent — la DB a déjà été mise à jour */
        })
      }
    },
    [bucket, onChange, value],
  )

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((url) => (
          <div
            key={url}
            className="border-border bg-muted relative aspect-square overflow-hidden rounded-md border"
          >
            <Image
              src={url}
              alt="Image téléversée"
              fill
              sizes="(max-width: 640px) 50vw, 200px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground border-border absolute top-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border shadow-sm transition-colors"
              aria-label="Supprimer l’image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <label
            htmlFor={inputId}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              handleFiles(e.dataTransfer.files)
            }}
            className={cn(
              'border-border bg-muted/30 hover:bg-muted text-muted-foreground flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs transition-colors',
              isDragging && 'border-primary bg-primary/5',
              isPending && 'pointer-events-none opacity-60',
            )}
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span className="px-2 text-center leading-tight">Ajouter une image</span>
              </>
            )}
            <input
              id={inputId}
              type="file"
              accept={ACCEPTED_IMAGE_EXTENSIONS.join(',')}
              multiple={maxImages > 1}
              className="sr-only"
              disabled={isPending}
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </label>
        )}
      </div>

      <p className="text-muted-foreground text-xs">
        {value.length}/{maxImages} image(s) · formats : {ACCEPTED_IMAGE_EXTENSIONS.join(', ')} · max{' '}
        {MAX_FILE_SIZE_MB} Mo par fichier
      </p>

      {value.length > 0 && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const paths = value
                .map((url) => publicUrlToPath(url, bucket))
                .filter((p): p is string => p !== null)
              onChange([])
              if (paths.length > 0) deleteFiles({ bucket, paths }).catch(() => {})
            }}
            disabled={isPending}
          >
            Tout retirer
          </Button>
        </div>
      )}
    </div>
  )
}
