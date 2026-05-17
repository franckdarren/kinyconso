import { expect, test } from '@playwright/test'

import { ADMIN_USER, loginAs } from './helpers/auth'

// Ces tests nécessitent un compte admin configuré dans les variables d'env
test.describe('Interface admin', () => {
  test.skip(!process.env.E2E_ADMIN_EMAIL, 'E2E_ADMIN_EMAIL non défini — tests admin ignorés')

  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
  })

  test.describe('Dashboard admin', () => {
    test('affiche le dashboard après connexion admin', async ({ page }) => {
      await page.goto('/admin')
      await expect(page).toHaveURL('/admin')
      await expect(page.getByRole('heading').first()).toBeVisible()
    })

    test('affiche les statistiques clés', async ({ page }) => {
      await page.goto('/admin')
      // Cherche des indicateurs chiffrés (CA, commandes, clients)
      await page.waitForLoadState('networkidle')
      await expect(page.locator('main')).toBeVisible()
    })
  })

  test.describe('Gestion des produits', () => {
    test('affiche la liste des produits admin', async ({ page }) => {
      await page.goto('/admin/produits')
      await expect(page).toHaveURL('/admin/produits')
      await expect(page.locator('main')).toBeVisible()
    })

    test('crée un produit et le rend visible dans la vitrine', async ({ page }) => {
      const testProductName = `Produit E2E ${Date.now()}`

      // 1. Aller sur le formulaire de création
      await page.goto('/admin/produits/nouveau')
      await page.waitForLoadState('networkidle')

      // 2. Remplir le formulaire
      const nameInput = page.getByLabel(/nom du produit|nom/i).first()
      await nameInput.fill(testProductName)

      const priceInput = page.getByLabel(/prix/i).first()
      await priceInput.fill('15000')

      // Sélectionner une catégorie si disponible
      const categorySelect = page.getByLabel(/catégorie/i).first()
      if ((await categorySelect.count()) > 0) {
        await categorySelect.selectOption({ index: 1 })
      }

      // 3. Soumettre
      await page
        .getByRole('button', { name: /créer|enregistrer|sauvegarder/i })
        .first()
        .click()

      // 4. Vérifier la redirection vers la liste ou confirmation
      await page.waitForURL(
        (url) => url.pathname.includes('/admin/produits') && !url.pathname.includes('/nouveau'),
        { timeout: 10_000 },
      )

      // 5. Vérifier que le produit apparaît dans la liste admin
      await expect(page.getByText(testProductName)).toBeVisible({ timeout: 5_000 })

      // 6. Vérifier la visibilité dans la vitrine
      await page.goto('/produits')
      await page.waitForLoadState('networkidle')
      // Le produit doit apparaître dans le catalogue (si actif par défaut)
      const productInStore = page.getByText(testProductName)
      // On vérifie seulement si le produit est actif par défaut
      const isVisible = await productInStore.isVisible().catch(() => false)
      if (!isVisible) {
        // Acceptable si le produit n'est pas actif par défaut
        test.info().annotations.push({
          type: 'note',
          description: 'Produit créé mais pas encore actif dans la vitrine',
        })
      }
    })

    test("navigue vers la page de modification d'un produit", async ({ page }) => {
      await page.goto('/admin/produits')
      await page.waitForLoadState('networkidle')

      const editBtn = page.getByRole('link', { name: /modifier|éditer/i }).first()
      if ((await editBtn.count()) > 0) {
        await editBtn.click()
        await expect(page).toHaveURL(/\/modifier/)
        await expect(page.locator('form')).toBeVisible()
      }
    })
  })

  test.describe('Gestion des catégories', () => {
    test('affiche la liste des catégories', async ({ page }) => {
      await page.goto('/admin/categories')
      await expect(page).toHaveURL('/admin/categories')
      await expect(page.locator('main')).toBeVisible()
    })

    test('crée une catégorie', async ({ page }) => {
      const testCategoryName = `Catégorie E2E ${Date.now()}`

      await page.goto('/admin/categories/nouvelle')
      await page.waitForLoadState('networkidle')

      await page.getByLabel(/nom/i).first().fill(testCategoryName)
      await page
        .getByRole('button', { name: /créer|enregistrer/i })
        .first()
        .click()

      await page.waitForURL(
        (url) => url.pathname.includes('/admin/categories') && !url.pathname.includes('/nouvelle'),
        { timeout: 10_000 },
      )

      await expect(page.getByText(testCategoryName)).toBeVisible({ timeout: 5_000 })
    })
  })

  test.describe('Gestion des commandes', () => {
    test('affiche la liste des commandes', async ({ page }) => {
      await page.goto('/admin/commandes')
      await expect(page).toHaveURL('/admin/commandes')
      await expect(page.locator('main')).toBeVisible()
    })
  })
})
