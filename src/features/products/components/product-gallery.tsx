'use client'

import { useState } from 'react'
import Image from 'next/image'

import { cn } from '@/lib/utils/cn'

interface ProductGalleryProps {
  images: string[]
  alt: string
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const safe = images.length > 0 ? images : []
  const current = safe[active] ?? null

  return (
    <div className="space-y-3">
      <div className="bg-muted border-border relative aspect-square w-full overflow-hidden rounded-lg border">
        {current ? (
          <Image
            src={current}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            Aucune image
          </div>
        )}
      </div>

      {safe.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {safe.map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                'border-border bg-muted relative aspect-square overflow-hidden rounded-md border transition-all',
                idx === active && 'ring-primary ring-2 ring-offset-2',
              )}
              aria-label={`Aperçu ${idx + 1}`}
            >
              <Image
                src={src}
                alt={`${alt} – ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
