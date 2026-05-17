import 'server-only'

import { and, count, desc, eq, ilike, ne, notInArray, or, sql, sum } from 'drizzle-orm'

import { db } from '@/db'
import { orders, users } from '@/db/schema'
import type { OrderStatus, UserRole } from '@/db/schema/enums'

const REVENUE_EXCLUDED_STATUSES: OrderStatus[] = ['pending', 'cancelled', 'refunded']

export interface CustomerListRow {
  id: string
  fullName: string | null
  phone: string | null
  city: string | null
  role: UserRole
  createdAt: Date
  ordersCount: number
  totalSpent: number
  lastOrderAt: Date | null
}

export interface CustomersFilters {
  search?: string
  page?: number
  pageSize?: number
}

export interface CustomersPage {
  rows: CustomerListRow[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

export async function getAllCustomers(filters: CustomersFilters = {}): Promise<CustomersPage> {
  const page = Math.max(filters.page ?? 1, 1)
  const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100)
  const offset = (page - 1) * pageSize

  const conditions = [ne(users.role, 'admin')]
  if (filters.search) {
    const s = `%${filters.search.trim()}%`
    conditions.push(or(ilike(users.fullName, s), ilike(users.phone, s))!)
  }
  const where = and(...conditions)

  const [rows, [{ value: total } = { value: 0 }]] = await Promise.all([
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        phone: users.phone,
        city: users.city,
        role: users.role,
        createdAt: users.createdAt,
        ordersCount: sql<number>`coalesce(count(${orders.id}) filter (where ${orders.id} is not null), 0)`,
        totalSpent: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.status} not in ('pending','cancelled','refunded')), 0)`,
        lastOrderAt: sql<Date | null>`max(${orders.createdAt})`,
      })
      .from(users)
      .leftJoin(orders, eq(orders.userId, users.id))
      .where(where)
      .groupBy(users.id)
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ value: count() }).from(users).where(where),
  ])

  const totalNumber = Number(total)
  return {
    rows: rows.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      phone: r.phone,
      city: r.city,
      role: r.role,
      createdAt: r.createdAt,
      ordersCount: Number(r.ordersCount),
      totalSpent: Number(r.totalSpent),
      lastOrderAt: r.lastOrderAt,
    })),
    total: totalNumber,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(totalNumber / pageSize), 1),
  }
}

export interface CustomerDetail {
  id: string
  fullName: string | null
  phone: string | null
  address: string | null
  city: string | null
  role: UserRole
  createdAt: Date
  ordersCount: number
  totalSpent: number
  lastOrderAt: Date | null
  averageOrderValue: number
}

export async function getCustomerById(id: string): Promise<CustomerDetail | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!user) return null

  const [agg] = await db
    .select({
      ordersCount: count(),
      totalSpent: sum(orders.total).mapWith(Number),
      lastOrderAt: sql<Date | null>`max(${orders.createdAt})`,
    })
    .from(orders)
    .where(and(eq(orders.userId, id), notInArray(orders.status, REVENUE_EXCLUDED_STATUSES)))

  const ordersCount = Number(agg?.ordersCount ?? 0)
  const totalSpent = Number(agg?.totalSpent ?? 0)
  const averageOrderValue = ordersCount > 0 ? Math.round(totalSpent / ordersCount) : 0

  return {
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    address: user.address,
    city: user.city,
    role: user.role,
    createdAt: user.createdAt,
    ordersCount,
    totalSpent,
    lastOrderAt: agg?.lastOrderAt ?? null,
    averageOrderValue,
  }
}
