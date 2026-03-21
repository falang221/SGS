import { test, expect, type Page } from '@playwright/test';

const SEEDED_DIRECTOR_EMAIL = 'directeur@ecole.sn';
const SEEDED_DIRECTOR_PASSWORD = 'admin12345';

async function loginAsSeedDirector(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', SEEDED_DIRECTOR_EMAIL);
  await page.fill('input[name="password"]', SEEDED_DIRECTOR_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
  await expect(page.getByText('Pilotage', { exact: false })).toBeVisible({ timeout: 15000 });
}

async function openNavigationIfMobile(page: Page, isMobile: boolean) {
  if (!isMobile) return;

  await page.getByRole('button', { name: /ouvrir le menu/i }).click();
}

/**
 * Suite de tests E2E : Parcours Critique Directeur
 */
test.describe('Parcours Critique : Direction & Pédagogie', () => {

  test('Doit permettre au directeur de se connecter et consulter les effectifs', async ({ page, isMobile }) => {
    // 1. Accès à la page de connexion
    await page.goto('/login');
    
    // Vérifier que la page de connexion est prête
    await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible();

    // 2. Authentification
    await loginAsSeedDirector(page);

    // 3. Vérification du Dashboard
    await expect(page.getByText('Élèves Inscrits')).toBeVisible({ timeout: 15000 });

    // 4. Navigation vers l'annuaire
    await openNavigationIfMobile(page, isMobile);
    await page.getByRole('link', { name: 'Élèves & Inscriptions' }).click();
    await expect(page).toHaveURL(/\/dashboard\/students$/);
    await expect(page.getByRole('heading', { name: /Effectif Scolaire/i })).toBeVisible();

    // Vérifier qu'on peut ouvrir un dossier élève (si la table n'est pas vide)
    const firstRow = page.locator('table tbody tr').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      // Vérifier que le panneau latéral (Sheet) s'ouvre
      await expect(page.getByRole('heading', { name: 'Dossier Élève' })).toBeVisible();
    }
  });

  test('Doit permettre la saisie de notes et calculer les stats en live', async ({ page, isMobile }) => {
    // Connexion rapide (on suppose qu'on est déjà loggé ou on réutilise l'état)
    await loginAsSeedDirector(page);

    // 1. Navigation vers les Notes
    await openNavigationIfMobile(page, isMobile);
    await page.getByRole('link', { name: 'Notes & Bulletins' }).click();
    await expect(page).toHaveURL(/\/dashboard\/grades$/);

    // 2. Sélection du contexte (Classe/Matière)
    // On attend que les données soient chargées
    const selects = page.locator('select');
    await selects.nth(0).selectOption({ index: 1 });
    await selects.nth(1).selectOption({ index: 1 });

    // 3. Saisie d'une note
    const firstGradeInput = page.locator('input[type="number"]').first();
    await expect(firstGradeInput).toBeVisible();
    await firstGradeInput.fill('15');

    // 4. Vérification du calcul live
    await expect(page.getByText('Bien', { exact: true })).toBeVisible();
    
    // La moyenne de session doit se mettre à jour
    await expect(page.getByText('Moyenne Session')).toBeVisible();
    await expect(page.getByText('15.00')).toBeVisible();
  });

  test('Doit être responsive sur mobile', async ({ page, isMobile }) => {
    if (!isMobile) return;

    await loginAsSeedDirector(page);

    // Sur mobile, la sidebar doit être cachée
    await expect(page.locator('aside')).toBeHidden();
    
    // Cliquer sur le menu pour l'ouvrir
    await page.getByRole('button', { name: /ouvrir le menu/i }).click();
    await expect(page.getByRole('link', { name: 'Vue d\'ensemble' })).toBeVisible();
  });

});
