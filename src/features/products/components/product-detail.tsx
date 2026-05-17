import Link from 'next/link'

import { AddToCartButton } from './add-to-cart-button'
import { PriceTag } from './price-tag'
import { ProductGallery } from './product-gallery'

interface ProductDetailProps {
  product: {
    id: string
    slug: string
    name: string
    description: string | null
    price: number
    compareAtPrice: number | null
    stockQuantity: number
    images: string[]
    categoryName: string | null
    categorySlug: string | null
    weight: number | null
  }
}

export function ProductDetail({ product }: ProductDetailProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ProductGallery images={product.images} alt={product.name} />

      <div className="flex flex-col gap-4">
        {product.categoryName && product.categorySlug && (
          <Link
            href={`/categories/${product.categorySlug}`}
            className="text-muted-foreground hover:text-foreground text-sm tracking-wide uppercase"
          >
            {product.categoryName}
          </Link>
        )}

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>

        <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />

        <p
          className={
            product.stockQuantity > 0
              ? 'text-primary text-sm font-medium'
              : 'text-destructive text-sm font-medium'
          }
        >
          {product.stockQuantity > 0
            ? `${product.stockQuantity} en stock`
            : 'Indisponible pour le moment'}
        </p>

        {product.description && (
          <div className="text-muted-foreground prose-sm text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        )}

        <div className="mt-4">
          <AddToCartButton
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            price={product.price}
            image={product.images[0] ?? null}
            stockQuantity={product.stockQuantity}
          />
        </div>

        {product.weight != null && (
          <p className="text-muted-foreground text-xs">Poids : {product.weight} g</p>
        )}
      </div>
    </div>
  )
}
