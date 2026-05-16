import 'dotenv/config'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'
import { categories, deliveryOptions, products } from './schema'
import { slugify } from '../lib/utils/slugify'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL est manquant. Renseigne-le dans .env.local.')
}

const client = postgres(connectionString, { max: 1, prepare: false })
const db = drizzle(client, { schema })

const CATEGORIES = [
  { name: 'Alimentation', description: 'Produits frais et épicerie' },
  { name: 'Boissons', description: 'Boissons fraîches, jus et eaux' },
  { name: 'Hygiène & Beauté', description: 'Soins du corps et cosmétiques' },
  { name: 'Maison', description: 'Entretien et accessoires pour la maison' },
  { name: 'Électronique', description: 'Petit électroménager et accessoires' },
] as const

const DELIVERY_OPTIONS = [
  {
    name: 'Livraison standard Libreville',
    description: 'Livraison sous 24 à 48 heures à Libreville et Akanda',
    price: 2000,
    estimatedDays: 2,
    sortOrder: 1,
  },
  {
    name: 'Livraison express',
    description: 'Livraison le jour même avant 18h (commandes passées avant 12h)',
    price: 5000,
    estimatedDays: 1,
    sortOrder: 2,
  },
  {
    name: 'Retrait en boutique',
    description: 'Récupérez votre commande gratuitement à notre point de retrait',
    price: 0,
    estimatedDays: 1,
    sortOrder: 0,
  },
] as const

type SeedProduct = {
  name: string
  description: string
  price: number
  stockQuantity: number
  categoryName: (typeof CATEGORIES)[number]['name']
  isFeatured?: boolean
}

const PRODUCTS: SeedProduct[] = [
  // Alimentation
  {
    name: 'Riz parfumé 5kg',
    description: 'Riz long grain de qualité supérieure',
    price: 7500,
    stockQuantity: 80,
    categoryName: 'Alimentation',
    isFeatured: true,
  },
  {
    name: 'Huile végétale 5L',
    description: 'Huile raffinée pour cuisson',
    price: 9500,
    stockQuantity: 50,
    categoryName: 'Alimentation',
  },
  {
    name: 'Sucre en poudre 1kg',
    description: 'Sucre blanc raffiné',
    price: 1200,
    stockQuantity: 120,
    categoryName: 'Alimentation',
  },
  {
    name: 'Farine de blé 1kg',
    description: 'Farine T55 pour pâtisserie et cuisine',
    price: 1500,
    stockQuantity: 90,
    categoryName: 'Alimentation',
  },

  // Boissons
  {
    name: 'Eau minérale 1.5L (pack de 6)',
    description: "Pack d'eau minérale naturelle",
    price: 3500,
    stockQuantity: 60,
    categoryName: 'Boissons',
    isFeatured: true,
  },
  {
    name: 'Jus d’orange 1L',
    description: 'Jus 100% pur fruit, sans sucre ajouté',
    price: 2500,
    stockQuantity: 40,
    categoryName: 'Boissons',
  },
  {
    name: 'Soda cola 33cl (pack de 24)',
    description: 'Pack de 24 canettes de cola',
    price: 12000,
    stockQuantity: 25,
    categoryName: 'Boissons',
  },
  {
    name: 'Café moulu 250g',
    description: 'Café arabica torréfié',
    price: 4500,
    stockQuantity: 35,
    categoryName: 'Boissons',
  },

  // Hygiène & Beauté
  {
    name: 'Savon de Marseille',
    description: 'Savon traditionnel 300g',
    price: 1800,
    stockQuantity: 100,
    categoryName: 'Hygiène & Beauté',
  },
  {
    name: 'Shampoing hydratant 400ml',
    description: 'Shampoing pour cheveux secs et abîmés',
    price: 3500,
    stockQuantity: 45,
    categoryName: 'Hygiène & Beauté',
    isFeatured: true,
  },
  {
    name: 'Crème hydratante visage',
    description: 'Soin hydratant 50ml pour tous types de peau',
    price: 6500,
    stockQuantity: 30,
    categoryName: 'Hygiène & Beauté',
  },
  {
    name: 'Brosse à dents (pack de 3)',
    description: 'Brosses à dents souples',
    price: 2000,
    stockQuantity: 80,
    categoryName: 'Hygiène & Beauté',
  },

  // Maison
  {
    name: 'Lessive liquide 3L',
    description: 'Lessive parfumée pour 50 lavages',
    price: 6500,
    stockQuantity: 40,
    categoryName: 'Maison',
  },
  {
    name: 'Liquide vaisselle 1L',
    description: 'Dégraissant efficace au citron',
    price: 1800,
    stockQuantity: 70,
    categoryName: 'Maison',
  },
  {
    name: 'Eau de javel 2L',
    description: 'Désinfectant ménager concentré',
    price: 1500,
    stockQuantity: 90,
    categoryName: 'Maison',
  },
  {
    name: 'Set de torchons (lot de 5)',
    description: 'Torchons coton 100%',
    price: 3500,
    stockQuantity: 55,
    categoryName: 'Maison',
  },

  // Électronique
  {
    name: 'Chargeur USB-C 20W',
    description: 'Chargeur rapide compatible iPhone et Android',
    price: 8500,
    stockQuantity: 25,
    categoryName: 'Électronique',
    isFeatured: true,
  },
  {
    name: 'Câble USB-C 1m',
    description: 'Câble tressé résistant',
    price: 3500,
    stockQuantity: 60,
    categoryName: 'Électronique',
  },
  {
    name: 'Écouteurs Bluetooth',
    description: 'Écouteurs sans fil avec étui de charge',
    price: 25000,
    stockQuantity: 15,
    categoryName: 'Électronique',
  },
  {
    name: 'Multiprise 4 ports + USB',
    description: 'Multiprise avec 4 prises et 2 ports USB',
    price: 12500,
    stockQuantity: 20,
    categoryName: 'Électronique',
  },
]

async function main() {
  console.warn('🌱 Démarrage du seed KinyConso...')

  // 1. Catégories
  console.warn(`  → Insertion de ${CATEGORIES.length} catégories`)
  const insertedCategories = await db
    .insert(categories)
    .values(
      CATEGORIES.map((cat, i) => ({
        name: cat.name,
        slug: slugify(cat.name),
        description: cat.description,
        sortOrder: i,
      })),
    )
    .onConflictDoNothing({ target: categories.slug })
    .returning()

  const categoriesByName = new Map(
    insertedCategories.length > 0
      ? insertedCategories.map((c) => [c.name, c.id] as const)
      : (await db.select().from(categories)).map((c) => [c.name, c.id] as const),
  )

  // 2. Options de livraison
  console.warn(`  → Insertion de ${DELIVERY_OPTIONS.length} options de livraison`)
  await db
    .insert(deliveryOptions)
    .values([...DELIVERY_OPTIONS])
    .onConflictDoNothing()

  // 3. Produits
  console.warn(`  → Insertion de ${PRODUCTS.length} produits`)
  const productRows = PRODUCTS.map((p) => {
    const categoryId = categoriesByName.get(p.categoryName)
    if (!categoryId) {
      throw new Error(`Catégorie introuvable pour ${p.name}: ${p.categoryName}`)
    }
    return {
      name: p.name,
      slug: slugify(p.name),
      description: p.description,
      price: p.price,
      stockQuantity: p.stockQuantity,
      categoryId,
      images: [],
      isFeatured: p.isFeatured ?? false,
    }
  })

  await db.insert(products).values(productRows).onConflictDoNothing({ target: products.slug })

  console.warn('✅ Seed terminé avec succès.')
  await client.end()
  process.exit(0)
}

main().catch(async (err) => {
  console.error('❌ Erreur lors du seed :', err)
  await client.end()
  process.exit(1)
})
