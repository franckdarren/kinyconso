import Link from 'next/link'

import { Button } from '@/components/ui/button'

interface PaginationProps {
  basePath: string
  searchParams: Record<string, string | undefined>
  page: number
  totalPages: number
}

function buildHref(basePath: string, params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, value)
  }
  search.set('page', String(page))
  return `${basePath}?${search.toString()}`
}

export function Pagination({ basePath, searchParams, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null

  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <nav className="flex items-center justify-center gap-2 pt-6" aria-label="Pagination">
      <Button asChild={hasPrev} variant="outline" size="sm" disabled={!hasPrev}>
        {hasPrev ? (
          <Link href={buildHref(basePath, searchParams, page - 1)}>Précédent</Link>
        ) : (
          <span>Précédent</span>
        )}
      </Button>
      <span className="text-muted-foreground px-2 text-sm">
        Page {page} / {totalPages}
      </span>
      <Button asChild={hasNext} variant="outline" size="sm" disabled={!hasNext}>
        {hasNext ? (
          <Link href={buildHref(basePath, searchParams, page + 1)}>Suivant</Link>
        ) : (
          <span>Suivant</span>
        )}
      </Button>
    </nav>
  )
}
