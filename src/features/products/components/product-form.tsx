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
import type { Product } from '@/db/schema'

import { createProduct, updateProduct } from '../actions'
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from '../schemas/product.schema'

interface ProductFormProps {
  categories: { id: string; name: string }[]
  initial?: Product
}

export function ProductForm({ categories, initial }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!initial
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>(initial?.images ?? [])

  type FormValues = CreateProductInput & { id?: string }

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? updateProductSchema : createProductSchema),
    defaultValues: {
      ...(isEdit ? { id: initial?.id } : {}),
      name: initial?.name ?? '',
      slug: initial?.slug ?? '',
      description: initial?.description ?? '',
      price: initial?.price ?? 0,
      compareAtPrice: initial?.compareAtPrice ?? null,
      stockQuantity: initial?.stockQuantity ?? 0,
      categoryId: initial?.categoryId ?? categories[0]?.id ?? '',
      isActive: initial?.isActive ?? true,
      isFeatured: initial?.isFeatured ?? false,
      weight: initial?.weight ?? null,
      images: initial?.images ?? [],
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
    const payload: CreateProductInput = { ...values, images }

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct({ ...(payload as UpdateProductInput), id: initial!.id })
        : await createProduct(payload)

      if (!result.success) {
        setServerError(result.error)
        toast.error(result.error)
        return
      }
      toast.success(isEdit ? 'Produit mis à jour' : 'Produit créé')
      router.push('/admin/produits')
      router.refresh()
    })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Informations générales</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              {...register('name')}
              onBlur={handleSlugAutofill}
              disabled={isPending}
            />
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
            {errors.slug && <p className="text-destructive text-sm">{errors.slug.message}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={5}
              className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm"
              {...register('description')}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="categoryId">Catégorie *</Label>
            <select
              id="categoryId"
              className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm"
              {...register('categoryId')}
              disabled={isPending}
            >
              {categories.length === 0 && <option value="">— Aucune catégorie —</option>}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-destructive text-sm">{errors.categoryId.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Prix et stock</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="price">Prix (FCFA) *</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step={100}
              {...register('price', { valueAsNumber: true })}
              disabled={isPending}
            />
            {errors.price && <p className="text-destructive text-sm">{errors.price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="compareAtPrice">Prix barré (FCFA)</Label>
            <Input
              id="compareAtPrice"
              type="number"
              min={0}
              step={100}
              {...register('compareAtPrice', {
                setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
              })}
              disabled={isPending}
            />
            {errors.compareAtPrice && (
              <p className="text-destructive text-sm">{errors.compareAtPrice.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Stock</Label>
            <Input
              id="stockQuantity"
              type="number"
              min={0}
              {...register('stockQuantity', { valueAsNumber: true })}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Poids (g)</Label>
            <Input
              id="weight"
              type="number"
              min={0}
              {...register('weight', {
                setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
              })}
              disabled={isPending}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Visibilité</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="border-input h-4 w-4 rounded"
              {...register('isActive')}
              disabled={isPending}
            />
            Produit actif
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="border-input h-4 w-4 rounded"
              {...register('isFeatured')}
              disabled={isPending}
            />
            Mettre en vedette (accueil)
          </label>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Images</h2>
        <ImageUploader bucket="products" value={images} onChange={setImages} maxImages={8} />
      </section>

      {serverError && (
        <p className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{serverError}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Enregistrer' : 'Créer le produit'}
        </Button>
      </div>
    </form>
  )
}
