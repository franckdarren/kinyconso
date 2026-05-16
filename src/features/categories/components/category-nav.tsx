import Link from 'next/link'

import { getRootActiveCategories } from '../queries'

export async function CategoryNav() {
  let cats: Awaited<ReturnType<typeof getRootActiveCategories>> = []
  try {
    cats = await getRootActiveCategories()
  } catch {
    return null
  }

  if (cats.length === 0) return null

  return (
    <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
      {cats.slice(0, 5).map((cat) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.slug}`}
          className="text-muted-foreground hover:text-foreground"
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  )
}
