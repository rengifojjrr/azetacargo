import { defineConfig } from '@playwright/test';
import { URL_SITIO } from './sitio.config.mjs';

// Por defecto prueba la compilación local (`astro preview`). Para probar el sitio publicado:
//   URL_PRUEBAS=https://rengifojjrr.github.io/azetacargo/ npx playwright test
const base = new URL(URL_SITIO).pathname.replace(/\/*$/, '/');
const urlLocal = `http://localhost:4321${base}`;
const urlPruebas = process.env.URL_PRUEBAS ?? urlLocal;

export default defineConfig({
  testDir: 'pruebas/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: urlPruebas,
    trace: 'retain-on-failure',
    locale: 'es-US',
    timezoneId: 'America/New_York',
  },
  projects: [
    {
      name: 'telefono',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'computadora',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: process.env.URL_PRUEBAS
    ? undefined
    : {
        command: 'npm run preview -- --port 4321',
        url: urlLocal,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
