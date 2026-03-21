import { defineConfig, devices } from '@playwright/test';

const includeCrossBrowserMatrix = process.env.CI === 'true' || process.env.PLAYWRIGHT_ALL_BROWSERS === '1';

const projects = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
];

if (includeCrossBrowserMatrix) {
  projects.splice(1, 0,
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  );
}

/**
 * Configuration Playwright pour le Système de Gestion Scolaire (SGS)
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    /* URL de base du frontend (Vite en dev ou Docker en prod) */
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Test contre différents navigateurs */
  projects,

  /* Lancer le serveur web avant les tests */
  webServer: [
    {
      command: 'pnpm -F @school-mgmt/api dev',
      url: 'http://localhost:3001/api/v1/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:sgs_password@localhost:5432/sgs_db?schema=public',
        PORT: '3001',
        NODE_ENV: 'test'
      }
    },
    {
      command: 'pnpm -F @school-mgmt/web dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
    }
  ],
});
