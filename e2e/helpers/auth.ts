import type { Page } from '@playwright/test'

export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? 'e2e-test@kinyconso.test',
  password: process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!',
  fullName: 'Test E2E',
  phone: '066999888',
}

export const ADMIN_USER = {
  email: process.env.E2E_ADMIN_EMAIL ?? 'admin@kinyconso.test',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'AdminPassword123!',
}

/** Connecte un utilisateur via le formulaire de connexion */
export async function loginAs(page: Page, user: { email: string; password: string }) {
  await page.goto('/auth/connexion')
  await page.getByLabel(/email/i).fill(user.email)
  await page.getByLabel(/mot de passe/i).fill(user.password)
  await page.getByRole('button', { name: /connexion/i }).click()
  await page.waitForURL((url) => !url.pathname.includes('/auth/connexion'), { timeout: 10_000 })
}

/** Déconnecte l'utilisateur courant */
export async function logout(page: Page) {
  await page.goto('/')
  // Le bouton déconnexion est dans le menu utilisateur
  const userMenu = page.getByRole('button', { name: /compte|profil|menu/i }).first()
  if (await userMenu.isVisible()) {
    await userMenu.click()
    const logoutBtn = page.getByRole('button', { name: /déconnexion|se déconnecter/i })
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click()
    }
  }
}
