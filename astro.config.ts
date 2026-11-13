import { defineConfig } from 'astro/config';
import { optimizarFotos } from './integraciones/optimizar-fotos.ts';
import { URL_SITIO } from './sitio.config.mjs';

const url = new URL(URL_SITIO);
const base = url.pathname.replace(/\/+$/, '') || '/';

export default defineConfig({
  site: url.origin,
  base,
  trailingSlash: 'always',
  output: 'static',
  // Compresión de HTML que respeta los espacios entre elementos en línea (la de Astro 6).
  compressHTML: true,
  build: {
    format: 'directory',
  },
  devToolbar: { enabled: false },
  integrations: [optimizarFotos()],
});
