# Storage Supabase

## Buckets

| Bucket       | Public | Écriture                           | Lecture       | Usage                          |
| ------------ | ------ | ---------------------------------- | ------------- | ------------------------------ |
| `products`   | ✅     | Admin uniquement                   | Tout le monde | Images de produits             |
| `categories` | ✅     | Admin uniquement                   | Tout le monde | Bannières/icônes de catégories |
| `avatars`    | ✅     | Utilisateur (son dossier) ou admin | Tout le monde | Photo de profil                |

Les buckets et leurs politiques sont créés par [`src/db/sql/03_storage.sql`](../src/db/sql/03_storage.sql).

## Conventions de chemin

```
products/<uuid>.<ext>
categories/<uuid>.<ext>
avatars/<userId>/<uuid>.<ext>
```

Le nom du fichier est généré côté serveur via `crypto.randomUUID()` pour éviter les collisions.

## Limites

- **Taille max** : 5 Mo par fichier (renforcée côté client, bucket Supabase, et server action)
- **Formats acceptés** : `image/jpeg`, `image/png`, `image/webp`
- **Compression automatique** côté client en WebP (Canvas API), max 1600×1600, qualité 85%
- Fallback en JPEG si WebP non supporté par le navigateur (rare)

## Utilisation côté admin

```tsx
'use client'

import { useState } from 'react'
import { ImageUploader } from '@/features/storage'

export function ProductImagesField() {
  const [images, setImages] = useState<string[]>([])

  return <ImageUploader bucket="products" value={images} onChange={setImages} maxImages={5} />
}
```

Le composant gère :

- Le drag & drop
- La prévisualisation
- La compression automatique avant upload
- La suppression (DB + Storage)
- Le retour des URLs publiques

## Server Actions

```ts
import { uploadFile, deleteFiles } from '@/features/storage'

// Upload (admin only pour products/categories)
const result = await uploadFile({
  bucket: 'products',
  file: someFile,
  folder: 'optional-subfolder',
})
// result.data.publicUrl
// result.data.path
```

```ts
// Suppression
await deleteFiles({
  bucket: 'products',
  paths: ['abc-uuid.webp'],
})
```

## Configuration Next.js

[`next.config.ts`](../next.config.ts) autorise les URLs publiques Supabase pour `next/image` :

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '<project>.supabase.co', pathname: '/storage/v1/object/public/**' },
  ],
}
```

Le hostname est dérivé automatiquement de `NEXT_PUBLIC_SUPABASE_URL`. En dev local sans Supabase, un wildcard `*.supabase.co` est utilisé.

## Critères Phase 5

- [x] Buckets `products`, `categories`, `avatars` créés (Supabase Storage)
- [x] Policies RLS : lecture publique, écriture admin (sauf avatars)
- [x] `ImageUploader` réutilisable avec drag & drop et preview
- [x] Validation taille + format (client + server + bucket)
- [x] Compression automatique en WebP côté client
- [ ] À tester quand `.env.local` Supabase sera renseigné
