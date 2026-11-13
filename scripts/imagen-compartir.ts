/**
 * Genera public/compartir.png (1200 × 630), la imagen que muestran WhatsApp, Facebook, etc. al compartir un enlace.
 * Usa las mismas fuentes, colores (tokens.css) y colibrí del sitio. Se corre a mano cuando cambie el logo:
 *   npx tsx scripts/imagen-compartir.ts
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { FACETAS_COLIBRI, OJO_COLIBRI, VISTA_COLIBRI } from '../src/lib/marca.ts';
import { leerTokens, valorToken } from '../src/lib/tokens.ts';

const raiz = process.cwd();
const tokens = leerTokens(readFileSync(path.join(raiz, 'src/estilos/tokens.css'), 'utf8'));
const color = (nombre: string) => valorToken(tokens, `--color-${nombre}`);
const requerir = createRequire(path.join(raiz, 'package.json'));
const fuente = (paquete: string, archivo: string) =>
  `data:font/woff2;base64,${readFileSync(path.join(path.dirname(requerir.resolve(`${paquete}/package.json`)), 'files', archivo)).toString('base64')}`;

const colibri = FACETAS_COLIBRI.map(
  (f) => `<polygon points="${f.puntos}" fill="${f.papel === 'acento' ? color('turquesa') : color('blanco')}"/>`,
).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Condensada'; font-weight: 600; src: url(${fuente('@fontsource/ibm-plex-sans-condensed', 'ibm-plex-sans-condensed-latin-600-normal.woff2')}) format('woff2'); }
@font-face { font-family: 'Texto'; font-weight: 400; src: url(${fuente('@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff2')}) format('woff2'); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: ${color('marino')}; color: ${color('blanco')}; font-family: 'Condensada'; }
.marco { position: absolute; inset: 72px 80px; display: flex; flex-direction: column; justify-content: space-between; }
.logo { display: flex; align-items: flex-start; gap: 10px; }
.palabras { display: grid; justify-items: start; }
.azeta { font-size: 112px; line-height: 0.8; letter-spacing: 0.05em; }
.cargo { margin-top: 22px; font-size: 40px; line-height: 1; letter-spacing: 0.98em; color: ${color('turquesa')}; }
svg { width: 150px; height: 125px; margin-top: -26px; }
.linea { height: 1px; background: ${color('linea-sobre-marino')}; }
.lema { font-size: 52px; line-height: 1.04; letter-spacing: 0.01em; text-transform: uppercase; max-width: 940px; }
.pie { font-family: 'Texto'; font-size: 26px; color: ${color('linea')}; margin-top: 18px; }
</style></head><body><div class="marco">
<div class="logo"><div class="palabras"><span class="azeta">AZETA</span><span class="cargo">CARGO</span></div>
<svg viewBox="${VISTA_COLIBRI}">${colibri}<rect x="${OJO_COLIBRI.x}" y="${OJO_COLIBRI.y}" width="${OJO_COLIBRI.lado}" height="${OJO_COLIBRI.lado}" fill="${color('marino')}"/></svg></div>
<div><div class="linea"></div></div>
<div><p class="lema">Electrónica, hogar, energía y herramientas. Desde Miami.</p>
<p class="pie">Tienda en línea y mayoreo. Electronics, home, power and tools.</p></div>
</div></body></html>`;

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
await pagina.setContent(html);
await pagina.evaluate(() => document.fonts.ready);
const salida = path.join(raiz, 'public', 'compartir.png');
await pagina.screenshot({ path: salida });
await navegador.close();
console.info(`✓ ${path.relative(raiz, salida)}`);
