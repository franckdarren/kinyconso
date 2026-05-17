'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, MessageSquarePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { addOrderNote } from '../actions'

interface OrderNoteFormProps {
  orderId: string
}

export function OrderNoteForm({ orderId }: OrderNoteFormProps) {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [isPending, startTransition] = useTransition()

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!value.trim()) return

    startTransition(async () => {
      const result = await addOrderNote({ id: orderId, note: value })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Note ajoutée')
      setValue('')
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <label className="text-sm font-medium" htmlFor="order-note">
        Nouvelle note interne
      </label>
      <textarea
        id="order-note"
        rows={3}
        maxLength={2000}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Note visible par les administrateurs uniquement"
        className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm"
        disabled={isPending}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" className="gap-2" disabled={isPending || !value.trim()}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageSquarePlus className="h-4 w-4" />
          )}
          Ajouter la note
        </Button>
      </div>
    </form>
  )
}
