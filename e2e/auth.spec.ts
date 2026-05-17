import { expect, test } from '@playwright/test'

test.describe('Authentification', () => {
  test.describe('Page de connexion', () => {
    test('affiche le formulaire de connexion', async ({ page }) => {
      await page.goto('/auth/connexion')
      await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/mot de passe/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /connexion/i })).toBeVisible()
    })

    test('affiche une erreur pour des identifiants incorrects', async ({ page }) => {
      await page.goto('/auth/connexion')
      await page.getByLabel(/email/i).fill('inconnu@example.com')
      await page.getByLabel(/mot de passe/i).fill('mauvaismdp')
      await page.getByRole('button', { name: /connexion/i }).click()

      // Doit rester sur la page de connexion avec un message d'erreur
      await expect(page).toHaveURL(/connexion/)
      const errorText = page.getByRole('alert').or(page.locator('[data-sonner-toast]'))
      await expect(errorText.first()).toBeVisible({ timeout: 5_000 })
    })

    test('redirige vers /auth/connexion si accès direct à /admin sans être admin', async ({
      page,
    }) => {
      await page.goto('/admin')
      await expect(page).toHaveURL(/connexion/, { timeout: 8_000 })
    })

    test('redirige vers /auth/connexion si accès à /compte/commandes sans être connecté', async ({
      page,
    }) => {
      await page.goto('/compte/commandes')
      await expect(page).toHaveURL(/connexion/, { timeout: 8_000 })
    })
  })

  test.describe("Page d'inscription", () => {
    test("affiche le formulaire d'inscription", async ({ page }) => {
      await page.goto('/auth/inscription')
      await expect(page.getByLabel(/nom complet/i)).toBeVisible()
      await expect(page.getByLabel(/téléphone/i)).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
    })

    test('affiche les erreurs de validation en français', async ({ page }) => {
      await page.goto('/auth/inscription')
      // Soumettre le formulaire vide pour déclencher la validation
      await page.getByRole('button', { name: /créer|inscription|s'inscrire/i }).click()

      // Au moins un message d'erreur doit être visible
      const errors = page.locator('[role="alert"], .error, [data-error]')
      await expect(errors.first()).toBeVisible({ timeout: 3_000 })
    })

    test('rejette si les mots de passe ne correspondent pas', async ({ page }) => {
      await page.goto('/auth/inscription')
      await page.getByLabel(/nom complet/i).fill('Jean Dupont')
      await page.getByLabel(/téléphone/i).fill('066000000')
      await page.getByLabel(/email/i).fill('jean@example.com')

      const passwordFields = page.getByLabel(/mot de passe/i)
      await passwordFields.first().fill('motdepasse1')
      await passwordFields.last().fill('different123')

      await page.getByRole('button', { name: /créer|inscription|s'inscrire/i }).click()
      await expect(page.getByText(/ne correspondent pas/i)).toBeVisible({ timeout: 3_000 })
    })
  })

  test.describe('Lien inscription ↔ connexion', () => {
    test("a un lien vers l'inscription depuis la connexion", async ({ page }) => {
      await page.goto('/auth/connexion')
      const link = page.getByRole('link', { name: /créer|inscription|s'inscrire/i })
      await expect(link).toBeVisible()
      await link.click()
      await expect(page).toHaveURL(/inscription/)
    })

    test("a un lien vers la connexion depuis l'inscription", async ({ page }) => {
      await page.goto('/auth/inscription')
      const link = page.getByRole('link', { name: /connexion|déjà un compte/i })
      await expect(link).toBeVisible()
      await link.click()
      await expect(page).toHaveURL(/connexion/)
    })
  })
})
