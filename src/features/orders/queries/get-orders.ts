import 'server-only'

import { cache } from 'react'
import { and, count, desc, eq, gte, ilike, inArray, lte, or } from 'drizzle-orm'

import { db } from '@/db'
import {
  deliveryOptions,
  orderItems,
  orders,
  payments,
  users,
  type DeliveryAddress,
  type Order,
  type OrderItem,
} from '@/db/schema'
import type { OrderStatus, PaymentStatus } from '@/db/schema/enums'

export type OrderItemRow = OrderItem

export interface OrderDetail extends Order {
  items: OrderItemRow[]
  payment: {
    id: string
    status: PaymentStatus
    operator: string
    amount: number
    merchantReferenceId: string
    pvitTransactionId: string | null
    pvitCallbackReceivedAt: Date | null
  } | null
  delivery: {
    id: string
    name: string
    estimatedDays: number | null
  } | null
  customer: {
    id: string
    fullName: string | null
    phone: string | null
  } | null
  deliveryAddress: DeliveryAddress
}

export const getOrderById = cache(async (id: string): Promise<OrderDetail | null> => {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
  if (!order) return null

  const [items, [payment], [delivery], [customer]] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db.select().from(payments).where(eq(payments.orderId, id)).limit(1),
    db
      .select({
        id: deliveryOptions.id,
        name: deliveryOptions.name,
        estimatedDays: deliveryOptions.estimatedDays,
      })
      .from(deliveryOptions)
      .where(eq(deliveryOptions.id, order.deliveryOptionId))
      .limit(1),
    db
      .select({ id: users.id, fullName: users.fullName, phone: users.phone })
      .from(users)
      .where(eq(users.id, order.userId))
      .limit(1),
  ])

  return {
    ...order,
    items,
    payment: payment
      ? {
          id: payment.id,
          status: payment.status,
          operator: payment.operator,
          amount: payment.totalAmount,
          merchantReferenceId: payment.merchantReferenceId,
          pvitTransactionId: payment.pvitTransactionId,
          pvitCallbackReceivedAt: payment.pvitCallbackReceivedAt,
        }
      : null,
    delivery: delivery ?? null,
    customer: customer ?? null,
  }
})

export interface OrderListRow {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  total: number
  createdAt: Date
  customerName: string | null
  customerPhone: string | null
  itemsCount: number
}

export const getUserOrders = cache(async (userId: string): Promise<OrderListRow[]> => {
  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      userId: orders.userId,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      deliveryAddress: orders.deliveryAddress,
    })
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))

  if (rows.length === 0) return []

  const itemsCounts = await db
    .select({ orderId: orderItems.orderId, n: count() })
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        rows.map((r) => r.id),
      ),
    )
    .groupBy(orderItems.orderId)
  const countMap = new Map(itemsCounts.map((c) => [c.orderId, Number(c.n)] as const))

  return rows.map((r) => ({
    id: r.id,
    orderNumber: r.orderNumber,
    userId: r.userId,
    status: r.status,
    total: r.total,
    createdAt: r.createdAt,
    customerName: r.deliveryAddress.fullName,
    customerPhone: r.deliveryAddress.phone,
    itemsCount: countMap.get(r.id) ?? 0,
  }))
})

export interface OrdersFilters {
  status?: OrderStatus | 'all'
  search?: string
  from?: Date | null
  to?: Date | null
  page?: number
  pageSize?: number
}

export interface OrdersPage {
  rows: OrderListRow[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

export async function getAllOrders(filters: OrdersFilters = {}): Promise<OrdersPage> {
  const page = Math.max(filters.page ?? 1, 1)
  const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100)
  const offset = (page - 1) * pageSize

  const conditions = []
  if (filters.status && filters.status !== 'all') {
    conditions.push(eq(orders.status, filters.status))
  }
  if (filters.from) conditions.push(gte(orders.createdAt, filters.from))
  if (filters.to) conditions.push(lte(orders.createdAt, filters.to))
  if (filters.search) {
    const s = `%${filters.search.trim()}%`
    conditions.push(or(ilike(orders.orderNumber, s), ilike(users.fullName, s)))
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, [{ value: total } = { value: 0 }]] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        userId: orders.userId,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
        deliveryAddress: orders.deliveryAddress,
        customerName: users.fullName,
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .where(where),
  ])

  const ids = rows.map((r) => r.id)
  const itemsCounts =
    ids.length === 0
      ? []
      : await db
          .select({ orderId: orderItems.orderId, n: count() })
          .from(orderItems)
          .where(inArray(orderItems.orderId, ids))
          .groupBy(orderItems.orderId)
  const countMap = new Map(itemsCounts.map((c) => [c.orderId, Number(c.n)] as const))

  const totalNumber = Number(total)
  return {
    rows: rows.map((r) => ({
      id: r.id,
      orderNumber: r.orderNumber,
      userId: r.userId,
      status: r.status,
      total: r.total,
      createdAt: r.createdAt,
      customerName: r.customerName ?? r.deliveryAddress.fullName,
      customerPhone: r.deliveryAddress.phone,
      itemsCount: countMap.get(r.id) ?? 0,
    })),
    total: totalNumber,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(totalNumber / pageSize), 1),
  }
}
