/**
 * Revisa el sitio YA COMPILADO (dist/). Correr después de `npm run build`:  npm run test:compilado
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const RAIZ = fileURLToPath(new URL('../../', import.meta.url));
const DIST = path.join(RAIZ, 'dist');

function archivos(carpeta: string, extension: RegExp): string[] {
  return readdirSync(carpeta).flatMap((nombre) => {
    const ruta = path.join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) return archivos(ruta, extension);
    return extension.test(nombre) ? [ruta] : [];
  });
}

/** Todo el CSS publicado: archivos .css, bloques <style> y atributos style="" de las páginas. */
function cssPublicado(): { origen: string; css: string }[] {
  const hojas = archivos(DIST, /\.css$/).map((r) => ({ origen: path.relative(DIST, r), css: readFileSync(r, 'utf8') }));
  const enPaginas = archivos(DIST, /\.html$/).flatMap((r) => {
    const html = readFileSync(r, 'utf8');
    const origen = path.relative(DIST, r);
    return [
      ...[...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => ({ origen, css: m[1] ?? '' })),
      ...[...html.matchAll(/\sstyle="([^"]*)"/g)].map((m) => ({ origen: `${origen} (style="")`, css: m[1] ?? '' })),
    ];
  });
  return [...hojas, ...enPaginas];
}

function variables(fuentes: { css: string }[]): Map<string, string> {
  const mapa = new Map<string, string>();
  for (const { css } of fuentes) {
    for (const [, nombre, valor] of css.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)) {
      if (nombre && valor) mapa.set(nombre, valor.trim());
    }
  }
  return mapa;
}

function resolver(valor: string, mapa: Map<string, string>, profundidad = 0): string {
  if (profundidad > 10) return valor;
  return valor.replace(/var\((--[\w-]+)(?:\s*,\s*([^)]+))?\)/g, (_, nombre: string, respaldo?: string) =>
    resolver(mapa.get(nombre) ?? respaldo ?? '0', mapa, profundidad + 1),
  );
}

/** Convierte cada medida del valor a px. Lo que no se puede medir (%, vw…) cuenta como infinito si no es 0. */
function medidasEnPx(valor: string): number[] {
  return valor
    .replace(/\//g, ' ')
    .split(/\s+/)
    .filter((p) => p !== '' && !/^(inherit|initial|unset|revert|revert-layer)$/i.test(p))
    .map((parte) => {
      const m = /^(-?[\d.]+)(px|rem|em|%|[a-z]+)?$/i.exec(parte);
      if (!m) return Number.POSITIVE_INFINITY;
      const numero = Number(m[1]);
      const unidad = (m[2] ?? '').toLowerCase();
      if (numero === 0) return 0;
      if (unidad === 'px') return numero;
      if (unidad === 'rem' || unidad === 'em') return numero * 16;
      return Number.POSITIVE_INFINITY;
    });
}

describe('sitio compilado', () => {
  it('existe dist/ (correr `npm run build` antes)', () => {
    expect(existsSync(path.join(DIST, 'index.html'))).toBe(true);
  });

  it('ningún border-radius pasa de 2 px en el CSS compilado', () => {
    const fuentes = cssPublicado();
    expect(fuentes.length).toBeGreaterThan(0);
    const mapa = variables(fuentes);
    const malos: string[] = [];
    let revisados = 0;
    for (const { origen, css } of fuentes) {
      for (const [declaracion, valor] of css.matchAll(/border(?:-[a-z]+)*-radius\s*:\s*([^;}]+)/gi)) {
        revisados++;
        const resuelto = resolver(valor ?? '', mapa);
        if (medidasEnPx(resuelto).some((px) => px > 2)) malos.push(`${origen}: «${declaracion.trim()}» → ${resuelto}`);
      }
    }
    expect(revisados).toBeGreaterThan(0);
    expect(malos).toEqual([]);
  });

  it('la revisión de border-radius detecta esquinas redondeadas', () => {
    const mapa = new Map([['--r', '8px']]);
    expect(medidasEnPx(resolver('var(--r)', mapa)).some((px) => px > 2)).toBe(true);
    expect(medidasEnPx('50%').some((px) => px > 2)).toBe(true);
    expect(medidasEnPx('0.5rem').some((px) => px > 2)).toBe(true);
    expect(medidasEnPx('0 0 2px 2px').some((px) => px > 2)).toBe(false);
  });

  it('los colores hexadecimales del CSS publicado solo están en los tokens', () => {
    const fuera: string[] = [];
    for (const { origen, css } of cssPublicado()) {
      const sinTokens = css.replace(/--color-[\w-]+\s*:\s*#[0-9a-fA-F]{3,8}/g, '');
      for (const m of sinTokens.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        // El minificador escribe «transparent» como #0000: no es un color escrito a mano.
        if (!/^#0000(0000)?$/.test(m[0])) fuera.push(`${origen}: ${m[0]}`);
      }
    }
    expect(fuera).toEqual([]);
  });

  it('las fuentes se sirven desde el propio sitio (sin Google Fonts)', () => {
    const textos = archivos(DIST, /\.(html|css|js)$/).map((r) => readFileSync(r, 'utf8'));
    expect(textos.some((t) => /fonts\.(googleapis|gstatic)\.com/.test(t))).toBe(false);
    expect(archivos(DIST, /\.woff2$/).length).toBeGreaterThan(0);
  });

  it('no hay archivo CNAME todavía (el dominio se activa después)', () => {
    expect(existsSync(path.join(DIST, 'CNAME'))).toBe(false);
    expect(existsSync(path.join(RAIZ, 'public', 'CNAME'))).toBe(false);
  });

  it('cada página tiene idioma, título, descripción y su versión en el otro idioma', () => {
    const paginas = archivos(DIST, /\.html$/).filter((r) => !r.endsWith('404.html'));
    expect(paginas.length).toBeGreaterThan(100);
    for (const ruta of paginas) {
      const html = readFileSync(ruta, 'utf8');
      const nombre = path.relative(DIST, ruta);
      expect(html, nombre).toMatch(/<html lang="(es|en)"/);
      expect(html, nombre).toMatch(/<title>[^<]{5,}<\/title>/);
      expect(html, nombre).toMatch(/<meta name="description" content="[^"]{20,}"/);
      expect(html, nombre).toMatch(/<link rel="alternate" hreflang="es"/);
      expect(html, nombre).toMatch(/<link rel="alternate" hreflang="en"/);
      expect(html, nombre).toMatch(/<link rel="canonical"/);
    }
  });

  it('cada ficha de producto lleva datos estructurados schema.org/Product con precio en USD', () => {
    const fichas = archivos(path.join(DIST, 'producto'), /\.html$/);
    expect(fichas.length).toBeGreaterThanOrEqual(35);
    for (const ruta of fichas) {
      const html = readFileSync(ruta, 'utf8');
      const bloques = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
        (m) => JSON.parse(m[1] ?? '{}') as Record<string, unknown>,
      );
      const producto = bloques.find((b) => b['@type'] === 'Product') as
        | { sku?: string; offers?: { price?: string; priceCurrency?: string } }
        | undefined;
      expect(producto?.sku, ruta).toBeTruthy();
      expect(producto?.offers?.priceCurrency).toBe('USD');
      expect(Number(producto?.offers?.price)).toBeGreaterThan(0);
    }
  });

  it('el índice de búsqueda JSON tiene todos los productos', () => {
    const indice = JSON.parse(readFileSync(path.join(DIST, 'indice.json'), 'utf8')) as { productos: unknown[] };
    expect(indice.productos.length).toBeGreaterThanOrEqual(35);
  });
});
