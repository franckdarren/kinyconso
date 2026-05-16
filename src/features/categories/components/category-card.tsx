import Link from 'next/link'
import Image from 'next/image'

import { cn } from '@/lib/utils/cn'
import type { Category } from '@/db/schema'

interface CategoryCardProps {
  category: Pick<Category, 'slug' | 'name' | 'description' | 'imageUrl'>
  className?: string
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        'group bg-card border-border block overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="bg-muted relative aspect-[4/3] w-full">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            Aucune image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-card-foreground font-semibold">{category.name}</h3>
        {category.description && (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{category.description}</p>
        )}
      </div>
    </Link>
  )
}
