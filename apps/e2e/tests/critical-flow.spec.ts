import { test, expect } from '@playwright/test';

/**
 * Suite de tests E2E : Parcours Critique Directeur
 */
test.describe('Parcours Critique : Direction & Pédagogie', () => {

  test('Doit permettre au directeur de se connecter et consulter les effectifs', async ({ page }) => {
    // 1. Accès à la page de connexion
    await page.goto('/login');
    
    // Vérifier que le branding est présent
    await expect(page.locator('text=SGS.')).toBeVisible();

    // 2. Authentification
    await page.fill('input[name="email"]', 'admin@ecole.sn');
    await page.fill('input[name="password"]', 'admin12345');
    await page.click('button[type="submit"]');

    // 3. Vérification du Dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Pilotage Stratégique');
    
    // Vérifier la présence des KPI (exemple: Élèves Inscrits)
    await expect(page.locator('text=Élèves Inscrits')).toBeVisible();

    // 4. Navigation vers l'annuaire
    await page.click('text=Élèves & Inscriptions');
    await expect(page).toHaveURL('/dashboard/students');
    await expect(page.locator('h1')).toContainText('Annuaire Élèves');

    // Vérifier qu'on peut ouvrir un dossier élève (si la table n'est pas vide)
    const firstRow = page.locator('table tbody tr').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      // Vérifier que le panneau latéral (Sheet) s'ouvre
      await expect(page.locator('text=Dossier de l\'élève')).toBeVisible();
      await page.click('button >> .lucide-x'); // Fermer le sheet
    }
  });

  test('Doit permettre la saisie de notes et calculer les stats en live', async ({ page }) => {
    // Connexion rapide (on suppose qu'on est déjà loggé ou on réutilise l'état)
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@ecole.sn');
    await page.fill('input[name="password"]', 'admin12345');
    await page.click('button[type="submit"]');

    // 1. Navigation vers les Notes
    await page.click('text=Notes & Bulletins');
    await expect(page).toHaveURL('/dashboard/grades');

    // 2. Sélection du contexte (Classe/Matière)
    // On attend que les données soient chargées
    await page.selectOption('select >> nth=0', { index: 1 }); // Sélectionner la première classe disponible
    await page.selectOption('select >> nth=1', { index: 1 }); // Sélectionner la première matière

    // 3. Saisie d'une note
    const firstGradeInput = page.locator('input[type="number"]').first();
    await firstGradeInput.fill('15');

    // 4. Vérification du calcul live
    // Le badge de performance doit passer à "Excellent" ou "Bien"
    await expect(page.locator('text=Bien').or(page.locator('text=Excellent'))).toBeVisible();
    
    // La moyenne de session doit se mettre à jour
    await expect(page.locator('text=Moyenne Session')).toBeVisible();
    const avgValue = await page.locator('text=15.00').isVisible();
    expect(avgValue).toBeTruthy();
  });

  test('Doit être responsive sur mobile', async ({ page, isMobile }) => {
    if (!isMobile) return;

    await page.goto('/login');
    
    // Vérifier que le menu hamburger est présent au lieu de la sidebar
    await page.fill('input[name="email"]', 'admin@ecole.sn');
    await page.fill('input[name="password"]', 'admin12345');
    await page.click('button[type="submit"]');

    // Sur mobile, la sidebar doit être cachée
    await expect(page.locator('aside')).toBeHidden();
    
    // Cliquer sur le menu pour l'ouvrir
    await page.click('button >> .lucide-menu');
    await expect(page.locator('text=Vue d\'ensemble')).toBeVisible();
  });

});
