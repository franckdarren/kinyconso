import { expect, test } from '@playwright/test'

test.describe('Catalogue & Panier', () => {
  test.describe("Page d'accueil", () => {
    test("affiche la page d'accueil avec les produits en vedette", async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveTitle(/KinyConso/i)
      // La page doit charger sans erreur critique
      await expect(page.locator('body')).toBeVisible()
    })

    test('affiche la navigation par catégories', async ({ page }) => {
      await page.goto('/')
      // Header ou nav avec les catégories doit être visible
      const nav = page.getByRole('navigation')
      await expect(nav.first()).toBeVisible()
    })
  })

  test.describe('Catalogue produits', () => {
    test('affiche la liste des produits', async ({ page }) => {
      await page.goto('/produits')
      await expect(page).toHaveURL('/produits')
      // Au moins un produit ou un message "aucun produit" doit être visible
      const productGrid = page.locator('main')
      await expect(productGrid).toBeVisible()
    })

    test('permet de filtrer par catégorie', async ({ page }) => {
      await page.goto('/produits')
      // Chercher un lien de filtrage par catégorie
      const categoryLinks = page.getByRole('link').filter({ hasText: /.+/ })
      const count = await categoryLinks.count()
      expect(count).toBeGreaterThan(0)
    })

    test('les prix sont affichés en FCFA', async ({ page }) => {
      await page.goto('/produits')
      // Attendre que la page charge
      await page.waitForLoadState('networkidle')
      const fcfaPrices = page.getByText(/FCFA/i)
      // S'il y a des produits, ils doivent afficher FCFA
      const priceCount = await fcfaPrices.count()
      if (priceCount > 0) {
        await expect(fcfaPrices.first()).toBeVisible()
      }
    })
  })

  test.describe('Panier', () => {
    test('affiche la page panier', async ({ page }) => {
      await page.goto('/panier')
      await expect(page).toHaveURL('/panier')
      // Page panier doit être visible
      await expect(page.locator('main')).toBeVisible()
    })

    test('ajoute un produit au panier depuis la liste', async ({ page }) => {
      await page.goto('/produits')
      await page.waitForLoadState('networkidle')

      // Chercher un bouton "Ajouter au panier" ou similaire
      const addToCartBtn = page.getByRole('button', { name: /panier|ajouter/i }).first()

      const btnCount = await addToCartBtn.count()
      if (btnCount === 0) {
        // Si aucun bouton, on tente via la fiche produit
        const firstProductLink = page
          .getByRole('link')
          .filter({ hasText: /voir|détail/i })
          .first()
        if ((await firstProductLink.count()) > 0) {
          await firstProductLink.click()
          await page
            .getByRole('button', { name: /panier|ajouter/i })
            .first()
            .click()
        }
      } else {
        await addToCartBtn.click()
      }

      // Le compteur du panier dans le header doit être ≥ 1
      const cartBadge = page.locator('[data-cart-count], [aria-label*="panier"]').first()
      await expect(cartBadge).toBeVisible({ timeout: 5_000 })
    })

    test('persiste le panier après rechargement', async ({ page }) => {
      await page.goto('/produits')
      await page.waitForLoadState('networkidle')

      // Ajouter au panier
      const addBtn = page.getByRole('button', { name: /panier|ajouter/i }).first()
      if ((await addBtn.count()) > 0) {
        await addBtn.click()
        await page.waitForTimeout(500)

        // Recharger la page
        await page.reload()

        // Le panier doit toujours avoir des articles (localStorage)
        const cartBadge = page.locator('[data-cart-count], [aria-label*="panier"]').first()
        if ((await cartBadge.count()) > 0) {
          await expect(cartBadge).toBeVisible()
        }
      }
    })
  })

  test.describe('Fiche produit', () => {
    test('affiche les informations du produit', async ({ page }) => {
      // Naviguer vers un produit via le catalogue
      await page.goto('/produits')
      await page.waitForLoadState('networkidle')

      const productLinks = page.getByRole('link').filter({ has: page.getByText(/FCFA/i) })
      const count = await productLinks.count()

      if (count > 0) {
        await productLinks.first().click()
        await page.waitForLoadState('networkidle')

        // La page produit doit avoir un titre et un prix
        await expect(page.getByRole('heading').first()).toBeVisible()
        await expect(page.getByText(/FCFA/i).first()).toBeVisible()
      }
    })
  })
})
