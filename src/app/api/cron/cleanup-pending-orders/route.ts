import { NextResponse, type NextRequest } from 'next/server'
import { and, eq, lt } from 'drizzle-orm'

import { db } from '@/db'
import { orders } from '@/db/schema'
import { isAuthorizedCron } from '@/lib/utils/cron-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Cron Vercel — annule les commandes restées en `pending` depuis plus de 30 min.
 * Le stock n'est décrémenté qu'à la confirmation de paiement (status → confirmed),
 * donc aucune réincrément n'est nécessaire pour les commandes encore pending.
 * Planification : toutes les heures via vercel.json.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - 30 * 60 * 1000)

  try {
    const result = await db
      .update(orders)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(and(eq(orders.status, 'pending'), lt(orders.createdAt, cutoff)))
      .returning({ id: orders.id })

    const cancelled = result.length

    console.log(
      JSON.stringify({
        event: 'cron.cleanup_pending_orders.success',
        cancelled,
        cutoff: cutoff.toISOString(),
      }),
    )

    return NextResponse.json({ success: true, cancelled })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(JSON.stringify({ event: 'cron.cleanup_pending_orders.failed', error: message }))
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
