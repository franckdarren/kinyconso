'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/db'
import { orders } from '@/db/schema'
import { requireAdmin } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

const addNoteSchema = z.object({
  id: z.uuid(),
  note: z.string().min(1, 'Note vide').max(2000),
})

function formatNoteBlock(author: string, note: string): string {
  const ts = new Date().toISOString().slice(0, 16).replace('T', ' ')
  return `[${ts}] ${author} — ${note.trim()}`
}

/**
 * Ajoute une note interne à une commande (append au champ `notes`).
 * Réservé aux admins. La note est préfixée par horodatage + auteur.
 */
export async function addOrderNote(input: {
  id: string
  note: string
}): Promise<ActionResult<void>> {
  let admin
  try {
    admin = await requireAdmin()
  } catch {
    return { success: false, error: 'Réservé aux administrateurs' }
  }

  const parsed = addNoteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Note invalide',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const [order] = await db
    .select({ id: orders.id, notes: orders.notes })
    .from(orders)
    .where(eq(orders.id, parsed.data.id))
    .limit(1)

  if (!order) return { success: false, error: 'Commande introuvable' }

  const author = admin.fullName ?? admin.email ?? 'admin'
  const block = formatNoteBlock(author, parsed.data.note)
  const nextNotes = order.notes ? `${order.notes.trim()}\n${block}` : block

  await db
    .update(orders)
    .set({ notes: nextNotes, updatedAt: new Date() })
    .where(eq(orders.id, parsed.data.id))

  revalidatePath(`/admin/commandes/${parsed.data.id}`)
  return { success: true, data: undefined }
}
