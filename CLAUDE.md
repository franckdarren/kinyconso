# KinyConso — E-commerce PWA

PWA monovendeur, mobile-first, SEO-friendly. **Tout le texte visible en français. Devise : FCFA uniquement.**

> Docs détaillées : [`docs/schema.md`](docs/schema.md) · [`docs/pvit.md`](docs/pvit.md) · [`docs/implementation-order.md`](docs/implementation-order.md)

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16+ App Router |
| Langage | TypeScript strict |
| Base de données | PostgreSQL via Supabase |
| ORM | Drizzle ORM |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| UI | Tailwind CSS + shadcn/ui |
| Validation | Zod |
| State | Zustand |
| Paiement | PVIT (Airtel Money, Moov Money, Visa/Mastercard) |
| Push | Firebase Cloud Messaging (FCM) |
| PWA | next-pwa |
| Déploiement | Vercel |

---

## Structure du projet

```
src/
├── app/
│   ├── (store)/                    # Routes publiques vitrine
│   │   ├── page.tsx                # Accueil
│   │   ├── produits/[slug]/page.tsx
│   │   ├── categories/[slug]/page.tsx
│   │   ├── panier/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── commandes/[id]/page.tsx
│   ├── admin/                      # Interface admin (protégée)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── produits/ · commandes/ · categories/ · clients/ · livraisons/
│   ├── auth/
│   │   ├── connexion/page.tsx
│   │   ├── inscription/page.tsx
│   │   └── callback/route.ts
│   └── api/
│       ├── pvit/ (initiate · callback · check-status · kyc)
│       ├── cron/pvit-token/route.ts
│       └── webhooks/fcm/route.ts
├── components/
│   ├── ui/                         # shadcn/ui
│   └── shared/ (Header · Footer · Navbar · LoadingSpinner)
├── features/
│   ├── auth/ · products/ · categories/ · cart/ · checkout/
│   ├── orders/ · payments/pvit/ · notifications/ · dashboard/
│   └── users/ · storage/
├── lib/
│   ├── supabase/ (client.ts · server.ts · admin.ts)
│   └── utils/ (cn · format-price · generate-reference · slugify)
├── db/
│   ├── schema/ (index · users · products · categories · orders · …)
│   ├── migrations/
│   └── index.ts
├── stores/ (cart.store · ui.store · auth.store)
├── hooks/ (use-debounce · use-media-query · use-outside-click)
├── types/ (index · supabase · pvit)
└── config/ (site · pvit · fcm)
```

---

## Conventions de code

### Nommage
```
Composants      PascalCase    → ProductCard.tsx
Hooks           camelCase     → useCart.ts
Actions serveur camelCase     → createOrder.ts
Types           PascalCase    → OrderStatus
Constantes      UPPER_SNAKE   → MAX_CART_ITEMS
```

### Server Actions — pattern obligatoire
```ts
'use server'
export async function createProduct(data: CreateProductInput) {
  // 1. Validation Zod
  // 2. Vérification auth (admin only si besoin)
  // 3. Mutation Drizzle
  // 4. revalidatePath(...)
}
```

### Retour des actions — toujours ce pattern
```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
```

### Validation Zod — par feature
```ts
// features/products/schemas/product.schema.ts
export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  price: z.number().int().positive(),
})
```

---

## UI / UX

- **Mobile-first** — designer pour mobile en premier
- **Server Components** par défaut — `'use client'` seulement si nécessaire
- **`next/image`** systématiquement pour toutes les images
- **Lazy loading** sur les listes de produits
- **`generateMetadata`** SEO sur chaque page
- **`generateStaticParams`** pour catégories/produits si possible
- Formatage prix : `new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'`

### Pages vitrine
| Route | Description |
|---|---|
| `/` | Hero, produits en vedette, catégories |
| `/produits` | Catalogue, filtres, pagination |
| `/produits/[slug]` | Fiche produit |
| `/categories/[slug]` | Produits par catégorie |
| `/panier` | Panier |
| `/checkout` | Tunnel paiement |
| `/commandes/[id]` | Confirmation et suivi |
| `/auth/connexion` · `/auth/inscription` | Auth |

### Pages admin
| Route | Description |
|---|---|
| `/admin` | Dashboard stats |
| `/admin/produits` | CRUD produits |
| `/admin/commandes` | Liste + détail |
| `/admin/categories` | Gestion catégories |
| `/admin/clients` | Liste clients |
| `/admin/livraisons` | Options livraison |

---

## Variables d'environnement requises

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # SERVER ONLY

# PVIT
PVIT_URL_CODE=
PVIT_OPERATION_ACCOUNT_CODE=
PVIT_API_PASSWORD=                # SERVER ONLY
PVIT_CALLBACK_URL_CODE=

# Firebase FCM
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_SERVER_KEY=              # SERVER ONLY

# App
NEXT_PUBLIC_APP_URL=
CRON_SECRET=                      # SERVER ONLY
```

---

## Sécurité — règles absolues

- **Jamais** `SUPABASE_SERVICE_ROLE_KEY`, `PVIT_API_PASSWORD`, `FIREBASE_SERVER_KEY` dans le code client
- **RLS activé** sur toutes les tables Supabase sans exception
- Toutes les routes `/api/pvit/*` sont server-side uniquement
- `merchant_reference_id` généré avec `crypto.randomUUID()` côté serveur uniquement

### RLS minimales
```sql
-- users       : lecture/modification de son propre profil uniquement
-- orders      : un client ne voit que ses propres commandes
-- payments    : inaccessible en lecture directe côté client (admin only)
-- products    : lecture publique, écriture admin only
-- categories  : lecture publique, écriture admin only
-- cart        : un client ne voit que son propre panier
```

---

## Points critiques — ne jamais oublier

1. **PVIT Idempotence** — Vérifier `merchant_reference_id` avant tout traitement de webhook. Un même callback peut arriver plusieurs fois. Voir [`docs/pvit.md`](docs/pvit.md).

2. **PVIT Token rotation** — La clé `X-Secret` expire en 3600s. Le cron tourne toutes les 50 min. Sans cela, tous les paiements échouent.

3. **Prix en FCFA entiers** — `5000` = 5 000 FCFA. Jamais de float, jamais de centimes.

4. **Snapshot obligatoire** — À la création d'une commande, toujours snapshot `unit_price`, `product_name`, `product_image` dans `order_items`. Les prix peuvent changer après la commande.

5. **Snapshot delivery_fee** — Stocker le frais de livraison dans la commande au moment de la validation, jamais recalculer a posteriori.

6. **PVIT Fallback** — Si le webhook n'arrive pas en 3 min, le client peut appeler `/api/pvit/check-status`. Ne jamais laisser une commande bloquée en `pending`.
