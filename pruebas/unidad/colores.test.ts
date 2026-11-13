/**
 * Los colores solo se escriben en src/estilos/tokens.css. Ningún componente, vista, script ni estilo
 * puede tener un color escrito a mano (hexadecimal, rgb(), hsl()… ni nombres como «white» o «red»).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const RAIZ = fileURLToPath(new URL('../../', import.meta.url));
const TOKENS = path.join(RAIZ, 'src/estilos/tokens.css');

function archivos(carpeta: string): string[] {
  return readdirSync(carpeta).flatMap((nombre) => {
    const ruta = path.join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) return archivos(ruta);
    return /\.(astro|ts|css|js|mjs|svg)$/.test(nombre) ? [ruta] : [];
  });
}

// Nombres de color de CSS (los que se usan de verdad; los demás también cuentan).
const NOMBRES = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood ' +
    'cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray ' +
    'darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen ' +
    'darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue ' +
    'firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew ' +
    'hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan ' +
    'lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
    'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue ' +
    'mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred ' +
    'midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid ' +
    'palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple ' +
    'rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue ' +
    'slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white ' +
    'whitesmoke yellow yellowgreen'
  ).split(' '),
);

const HEX = /(?<![\w&/-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
const FUNCIONES = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(/g;
const PROPIEDADES_DE_COLOR =
  /(?:^|[;{\s])(color|background(?:-color)?|border(?:-(?:top|right|bottom|left|block|inline))?(?:-color)?|outline(?:-color)?|fill|stroke|box-shadow|text-shadow|text-decoration(?:-color)?|accent-color|caret-color|column-rule(?:-color)?)\s*:\s*([^;}]+)/g;
const ATRIBUTOS_SVG = /\b(?:fill|stroke|stop-color|color)=["']([a-zA-Z]+)["']/g;

function bloquesDeEstilo(ruta: string, texto: string): string[] {
  if (ruta.endsWith('.css')) return [texto];
  return [...texto.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? '');
}

function problemas(ruta: string): string[] {
  const texto = readFileSync(ruta, 'utf8');
  const encontrados: string[] = [];
  for (const m of texto.matchAll(HEX)) encontrados.push(`color hexadecimal ${m[0]}`);
  for (const m of texto.matchAll(FUNCIONES)) encontrados.push(`función de color ${m[0]}`);
  for (const bloque of bloquesDeEstilo(ruta, texto)) {
    for (const [, propiedad, valor] of bloque.matchAll(PROPIEDADES_DE_COLOR)) {
      for (const palabra of (valor ?? '').toLowerCase().match(/[a-z]+/g) ?? []) {
        if (NOMBRES.has(palabra)) encontrados.push(`«${propiedad}: ${(valor ?? '').trim()}» usa el color «${palabra}»`);
      }
    }
  }
  for (const [, nombre] of texto.matchAll(ATRIBUTOS_SVG)) {
    if (NOMBRES.has((nombre ?? '').toLowerCase())) encontrados.push(`atributo SVG con el color «${nombre}»`);
  }
  return encontrados.map((p) => `${path.relative(RAIZ, ruta)}: ${p}`);
}

describe('colores', () => {
  it('ningún componente, vista, script ni estilo tiene colores escritos a mano', () => {
    const revisados = archivos(path.join(RAIZ, 'src')).filter((r) => r !== TOKENS);
    expect(revisados.length).toBeGreaterThan(30);
    expect(revisados.flatMap(problemas)).toEqual([]);
  });

  it('los colores de la marca están en tokens.css con sus valores exactos', () => {
    const tokens = readFileSync(TOKENS, 'utf8');
    const esperados = {
      '--color-marino': '#0B2540',
      '--color-tinta': '#111418',
      '--color-gris': '#5B6470',
      '--color-linea': '#D9DDE3',
      '--color-fondo-imagen': '#F3F4F6',
      '--color-blanco': '#FFFFFF',
      '--color-naranja': '#F47A20',
      '--color-turquesa': '#14CFD2',
    };
    for (const [nombre, valor] of Object.entries(esperados)) {
      expect(tokens).toMatch(new RegExp(`${nombre}:\\s*${valor};`, 'i'));
    }
    expect(tokens).not.toMatch(/gradient/i);
  });

  it('la prueba detecta colores escritos a mano', () => {
    const ejemplo = path.join(RAIZ, 'pruebas/unidad/fixtures/con-colores.astro');
    expect(problemas(ejemplo)).toEqual([
      'pruebas/unidad/fixtures/con-colores.astro: color hexadecimal #fff',
      'pruebas/unidad/fixtures/con-colores.astro: función de color rgb(',
      'pruebas/unidad/fixtures/con-colores.astro: «background: white» usa el color «white»',
      'pruebas/unidad/fixtures/con-colores.astro: atributo SVG con el color «red»',
    ]);
  });
});
