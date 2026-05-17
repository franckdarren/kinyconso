import type { NotificationType, OrderStatus } from '@/db/schema/enums'

/**
 * Machine à états des statuts de commande.
 *
 * Statuts terminaux : `delivered`, `cancelled`, `refunded` (pas de retour
 * en arrière sauf via refund — uniquement depuis `delivered`).
 *
 * - `pending` → `confirmed` (paiement OK) | `cancelled` (paiement échoué/abandon)
 * - `confirmed` → `processing` | `cancelled`
 * - `processing` → `shipped` | `cancelled`
 * - `shipped` → `delivered` | `cancelled`
 * - `delivered` → `refunded`
 * - `cancelled`, `refunded` → terminal
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
}

export const TERMINAL_STATUSES: OrderStatus[] = ['delivered', 'cancelled', 'refunded']

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to)
}

export function isTerminal(status: OrderStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

/**
 * Mapping statut → type de notification à pousser au client lors d'une
 * transition de statut. `null` = pas de notification spécifique pour ce
 * statut. `order_confirmed` est déjà déclenché au paiement (phase 11),
 * mais on le ré-émet ici si l'admin force la transition manuellement.
 */
export const STATUS_NOTIFICATION: Record<OrderStatus, NotificationType | null> = {
  pending: null,
  confirmed: 'order_confirmed',
  processing: null,
  shipped: 'order_shipped',
  delivered: 'order_delivered',
  cancelled: 'payment_failed',
  refunded: null,
}

/**
 * Étape ordonnée pour l'affichage du fil de progression côté client.
 * Les statuts d'erreur (`cancelled`, `refunded`) sont gérés à part.
 */
export const ORDER_TIMELINE: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
]
