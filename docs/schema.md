# Schéma de base de données (Drizzle ORM)

## Conventions

- Clé primaire `uuid` (`gen_random_uuid()`) sur toutes les tables
- `created_at` et `updated_at` sur toutes les tables
- Colonnes en `snake_case`
- Soft delete avec `deleted_at` sur `products` et `orders`
- **Prix stockés en FCFA entiers** — `5000` = 5 000 FCFA. Jamais de float, jamais de centimes.

---

## `users` (extension de auth.users Supabase)

```ts
id: uuid (FK → auth.users.id)
full_name: text
phone: text
address: text
city: text
role: enum('customer', 'admin')  -- défaut: customer
fcm_token: text
created_at: timestamp
updated_at: timestamp
```

## `categories`

```ts
id: uuid
name: text (unique)
slug: text (unique)
description: text
image_url: text
parent_id: uuid (FK → categories.id, nullable)
is_active: boolean (défaut: true)
sort_order: integer (défaut: 0)
created_at: timestamp
updated_at: timestamp
```

## `products`

```ts
id: uuid
name: text
slug: text (unique)
description: text
price: integer               -- en FCFA entiers (ex: 5000 = 5 000 FCFA)
compare_at_price: integer    -- prix barré (nullable)
stock_quantity: integer (défaut: 0)
category_id: uuid (FK → categories.id)
images: text[]               -- tableau d'URLs Supabase Storage
is_active: boolean (défaut: true)
is_featured: boolean (défaut: false)
weight: integer              -- en grammes
deleted_at: timestamp        -- soft delete
created_at: timestamp
updated_at: timestamp
```

## `delivery_options`

```ts
id: uuid
name: text                   -- ex: "Livraison standard", "Livraison express"
description: text
price: integer               -- en FCFA entiers
estimated_days: integer
is_active: boolean (défaut: true)
sort_order: integer
created_at: timestamp
updated_at: timestamp
```

## `orders`

```ts
id: uuid
order_number: text (unique)  -- ex: CMD-2024-00001
user_id: uuid (FK → users.id)
status: enum('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
subtotal: integer            -- total produits en FCFA
delivery_fee: integer        -- snapshot du frais au moment de la commande
total: integer               -- subtotal + delivery_fee
delivery_option_id: uuid (FK → delivery_options.id)
delivery_address: jsonb      -- {full_name, phone, address, city}
notes: text
deleted_at: timestamp
created_at: timestamp
updated_at: timestamp
```

## `order_items`

```ts
id: uuid
order_id: uuid (FK → orders.id)
product_id: uuid (FK → products.id)
product_name: text           -- snapshot au moment de la commande
product_image: text          -- snapshot
unit_price: integer          -- snapshot en FCFA
quantity: integer
subtotal: integer            -- unit_price * quantity
created_at: timestamp
```

## `payments`

```ts
id: uuid
order_id: uuid (FK → orders.id, unique)
status: enum('pending', 'success', 'failed', 'cancelled')
operator: enum('AIRTEL_MONEY', 'MOOV_MONEY', 'VISA_MASTERCARD')
amount: integer
fees: integer
total_amount: integer
customer_phone: text
pvit_transaction_id: text
merchant_reference_id: text (unique)  -- IDEMPOTENCE — généré côté serveur
pvit_callback_received_at: timestamp
raw_callback_payload: jsonb           -- payload brut pour audit
created_at: timestamp
updated_at: timestamp
```

## `cart`

```ts
id: uuid
user_id: uuid (FK → users.id, unique)
items: jsonb                 -- [{product_id, quantity, price_snapshot}]
created_at: timestamp
updated_at: timestamp
```

## `notifications`

```ts
id: uuid
user_id: uuid (FK → users.id)
title: text
body: text
type: enum('order_confirmed', 'order_shipped', 'order_delivered', 'payment_success', 'payment_failed', 'promo')
data: jsonb
is_read: boolean (défaut: false)
sent_at: timestamp
created_at: timestamp
```
