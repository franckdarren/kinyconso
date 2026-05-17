import 'server-only'

import { and, desc, eq, gte, lt, notInArray, sql, sum } from 'drizzle-orm'

import { db } from '@/db'
import { orderItems, orders, products } from '@/db/schema'
import type { OrderStatus } from '@/db/schema/enums'

const REVENUE_EXCLUDED_STATUSES: OrderStatus[] = ['pending', 'cancelled', 'refunded']

export interface TopProductRow {
  productId: string
  productName: string
  slug: string | null
  image: string | null
  quantitySold: number
  revenue: number
}

export async function getTopProducts(
  range: { from: Date; to: Date },
  limit = 5,
): Promise<TopProductRow[]> {
  const rows = await db
    .select({
      productId: orderItems.productId,
      productName: orderItems.productName,
      slug: products.slug,
      image: sql<string | null>`coalesce(${orderItems.productImage}, (${products.images})[1])`,
      quantitySold: sum(orderItems.quantity).mapWith(Number),
      revenue: sum(orderItems.subtotal).mapWith(Number),
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(products.id, orderItems.productId))
    .where(
      and(
        gte(orders.createdAt, range.from),
        lt(orders.createdAt, range.to),
        notInArray(orders.status, REVENUE_EXCLUDED_STATUSES),
      ),
    )
    .groupBy(
      orderItems.productId,
      orderItems.productName,
      products.slug,
      orderItems.productImage,
      products.images,
    )
    .orderBy(desc(sum(orderItems.quantity)))
    .limit(limit)

  return rows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    slug: r.slug,
    image: r.image,
    quantitySold: Number(r.quantitySold ?? 0),
    revenue: Number(r.revenue ?? 0),
  }))
}
