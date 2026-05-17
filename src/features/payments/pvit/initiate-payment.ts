import 'server-only'

import { and, eq, inArray, isNull } from 'drizzle-orm'

import { db } from '@/db'
import { deliveryOptions, orderItems, orders, payments, products } from '@/db/schema'
import { generateMerchantReference } from '@/lib/utils/generate-reference'
import { getPvitServerEnv } from '@/config/pvit'

import { pvitInitiatePayment } from './client'
import { pvitLog } from './logger'
import { PvitError } from './types'
import type { InitiatePaymentInput } from './schemas'

export interface InitiatePaymentResult {
  orderId: string
  orderNumber: string
  merchantReferenceId: string
  pvitTransactionId: string | null
  paymentStatus: 'pending' | 'success' | 'failed' | 'cancelled'
  amount: number
}

export interface InitiatePaymentContext {
  userId: string
  customerEmail?: string | null
  customerName?: string | null
}

/**
 * Orchestre l'initiation d'un paiement PVIT :
 *   1. Recharge produits + option de livraison (prix actuel, stock, dispo).
 *   2. Valide cohérence (produit actif, stock, prix > 0).
 *   3. Crée order + order_items (snapshots) + payment (status: pending)
 *      dans une transaction unique.
 *   4. Appelle PVIT `/payments/initiate` et persiste `pvit_transaction_id`.
 *   5. Si l'appel PVIT échoue, on garde la commande en `pending` (le client
 *      pourra retry via /api/pvit/check-status).
 */
export async function initiatePvitPayment(
  input: InitiatePaymentInput,
  context: InitiatePaymentContext,
): Promise<InitiatePaymentResult> {
  const env = getPvitServerEnv()
  const productIds = input.items.map((i) => i.productId)

  const [deliveryRow] = await db
    .select()
    .from(deliveryOptions)
    .where(and(eq(deliveryOptions.id, input.deliveryOptionId), eq(deliveryOptions.isActive, true)))
    .limit(1)

  if (!deliveryRow) {
    throw new PvitError('Option de livraison invalide ou désactivée')
  }

  const productRows = await db
    .select()
    .from(products)
    .where(and(inArray(products.id, productIds), isNull(products.deletedAt)))

  if (productRows.length !== productIds.length) {
    throw new PvitError('Un ou plusieurs produits du panier sont introuvables')
  }

  const productMap = new Map(productRows.map((p) => [p.id, p] as const))

  let subtotal = 0
  const itemsForInsert: {
    productId: string
    productName: string
    productImage: string | null
    unitPrice: number
    quantity: number
    subtotal: number
  }[] = []

  for (const item of input.items) {
    const product = productMap.get(item.productId)
    if (!product || !product.isActive) {
      throw new PvitError(`Produit indisponible : ${product?.name ?? item.productId}`)
    }
    if (product.stockQuantity < item.quantity) {
      throw new PvitError(
        `Stock insuffisant pour « ${product.name} » (${product.stockQuantity} dispo)`,
      )
    }
    const lineSubtotal = product.price * item.quantity
    subtotal += lineSubtotal
    itemsForInsert.push({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0] ?? null,
      unitPrice: product.price,
      quantity: item.quantity,
      subtotal: lineSubtotal,
    })
  }

  const deliveryFee = deliveryRow.price
  const total = subtotal + deliveryFee
  const merchantReferenceId = generateMerchantReference()

  const { orderId, orderNumber, paymentId } = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        // order_number est généré par trigger SQL si vide (`set_order_number`).
        orderNumber: '',
        userId: context.userId,
        status: 'pending',
        subtotal,
        deliveryFee,
        total,
        deliveryOptionId: deliveryRow.id,
        deliveryAddress: input.deliveryAddress,
        notes: input.notes ?? null,
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber })

    if (!order) throw new PvitError('Création de commande échouée')

    await tx
      .insert(orderItems)
      .values(itemsForInsert.map((line) => ({ orderId: order.id, ...line })))

    const [payment] = await tx
      .insert(payments)
      .values({
        orderId: order.id,
        status: 'pending',
        operator: input.operator,
        amount: total,
        fees: 0,
        totalAmount: total,
        customerPhone: input.customerPhone ?? input.deliveryAddress.phone,
        merchantReferenceId,
      })
      .returning({ id: payments.id })

    if (!payment) throw new PvitError('Création du paiement échouée')

    return { orderId: order.id, orderNumber: order.orderNumber, paymentId: payment.id }
  })

  pvitLog.info({
    event: 'pvit.payment.order_created',
    merchantReferenceId,
    orderId,
    orderNumber,
    amount: total,
    operator: input.operator,
  })

  let pvitTransactionId: string | null = null
  let paymentStatus: InitiatePaymentResult['paymentStatus'] = 'pending'

  try {
    const pvitResponse = await pvitInitiatePayment({
      merchantReferenceId,
      amount: total,
      operator: input.operator,
      customerPhone: input.customerPhone ?? input.deliveryAddress.phone,
      customerEmail: context.customerEmail ?? undefined,
      customerName: context.customerName ?? input.deliveryAddress.fullName,
      description: `Commande ${orderNumber}`,
      callbackUrlCode: env.callbackUrlCode,
    })
    pvitTransactionId = pvitResponse.transactionId

    if (pvitResponse.status === 'FAILED') {
      paymentStatus = 'failed'
    }

    await db
      .update(payments)
      .set({
        pvitTransactionId: pvitResponse.transactionId,
        status: paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId))
  } catch (error) {
    pvitLog.error({
      event: 'pvit.payment.initiate_failed',
      merchantReferenceId,
      orderId,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }

  return {
    orderId,
    orderNumber,
    merchantReferenceId,
    pvitTransactionId,
    paymentStatus,
    amount: total,
  }
}
