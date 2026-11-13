import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unidad',
          include: ['pruebas/unidad/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        // Revisa el sitio ya compilado en dist/ (corre después de `npm run build`).
        test: {
          name: 'compilado',
          include: ['pruebas/compilado/**/*.test.ts'],
          environment: 'node',
        },
      },
    ],
  },
});
