'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUploader } from '@/features/storage/components/image-uploader'
import { slugify } from '@/lib/utils/slugify'
import type { Category } from '@/db/schema'

import { createCategory, updateCategory } from '../actions'
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '../schemas/category.schema'

interface CategoryFormProps {
  parents: Pick<Category, 'id' | 'name'>[]
  initial?: Category
}

export function CategoryForm({ parents, initial }: CategoryFormProps) {
  const router = useRouter()
  const isEdit = !!initial
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [image, setImage] = useState<string[]>(initial?.imageUrl ? [initial.imageUrl] : [])

  type FormValues = CreateCategoryInput & { id?: string }

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? updateCategorySchema : createCategorySchema),
    defaultValues: {
      ...(isEdit ? { id: initial?.id } : {}),
      name: initial?.name ?? '',
      slug: initial?.slug ?? '',
      description: initial?.description ?? '',
      imageUrl: initial?.imageUrl ?? '',
      parentId: initial?.parentId ?? null,
      isActive: initial?.isActive ?? true,
      sortOrder: initial?.sortOrder ?? 0,
    },
  })

  const handleSlugAutofill = () => {
    const { slug, name } = getValues()
    if (!slug && name) {
      setValue('slug', slugify(name), { shouldValidate: true })
    }
  }

  const onSubmit = handleSubmit((values) => {
    setServerError(null)
    const payload: CreateCategoryInput = {
      ...values,
      imageUrl: image[0] ?? '',
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateCategory({ ...(payload as UpdateCategoryInput), id: initial!.id })
        : await createCategory(payload)

      if (!result.success) {
        setServerError(result.error)
        toast.error(result.error)
        return
      }
      toast.success(isEdit ? 'Catégorie mise à jour' : 'Catégorie créée')
      router.push('/admin/categories')
      router.refresh()
    })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nom *</Label>
          <Input id="name" {...register('name')} onBlur={handleSlugAutofill} disabled={isPending} />
          {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            placeholder="auto-genere-depuis-le-nom"
            {...register('slug')}
            disabled={isPending}
          />
          <p className="text-muted-foreground text-xs">Laissez vide pour générer depuis le nom.</p>
          {errors.slug && <p className="text-destructive text-sm">{errors.slug.message}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={3}
            className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm"
            {...register('description')}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentId">Catégorie parente</Label>
          <select
            id="parentId"
            className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm"
            {...register('parentId', {
              setValueAs: (v) => (v === '' || v === null ? null : v),
            })}
            disabled={isPending}
          >
            <option value="">Aucune (catégorie racine)</option>
            {parents
              .filter((p) => p.id !== initial?.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Ordre d’affichage</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            {...register('sortOrder', { valueAsNumber: true })}
            disabled={isPending}
          />
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="isActive"
            type="checkbox"
            className="border-input h-4 w-4 rounded"
            {...register('isActive')}
            disabled={isPending}
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Catégorie active (visible côté boutique)
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Image</Label>
        <ImageUploader bucket="categories" value={image} onChange={setImage} maxImages={1} />
      </div>

      {serverError && (
        <p className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{serverError}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Enregistrer' : 'Créer la catégorie'}
        </Button>
      </div>
    </form>
  )
}
