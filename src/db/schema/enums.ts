import { pgEnum } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['customer', 'admin'])

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
])

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'success',
  'failed',
  'cancelled',
])

export const paymentOperatorEnum = pgEnum('payment_operator', [
  'AIRTEL_MONEY',
  'MOOV_MONEY',
  'VISA_MASTERCARD',
])

export const notificationTypeEnum = pgEnum('notification_type', [
  'order_confirmed',
  'order_shipped',
  'order_delivered',
  'payment_success',
  'payment_failed',
  'promo',
])

export type UserRole = (typeof userRoleEnum.enumValues)[number]
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number]
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number]
export type PaymentOperator = (typeof paymentOperatorEnum.enumValues)[number]
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number]
