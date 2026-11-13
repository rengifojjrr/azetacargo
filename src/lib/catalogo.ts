/**
 * Arma el catálogo a partir de los CSV de la carpeta catalogo/ y lo valida con zod.
 * Si hay errores, devuelve TODOS con su archivo, fila, SKU y campo, para que se puedan corregir de una vez.
 */
import { z } from 'zod';
import { leerCsv, pareceMalCodificado, type FilaCsv, type TablaCsv } from './csv.ts';
import { resolverFotos } from './fotos.ts';
import { esIcono } from './iconos.ts';
import { crearTraductor } from './glosario.ts';
import { unirMiles } from './texto.ts';
import { leerCaracteristicas, leerLista, leerPrecio, leerSiNo, type Caracteristica } from './valores.ts';

export type Idioma = 'es' | 'en';
export const IDIOMAS: readonly Idioma[] = ['es', 'en'];
export type Bilingue = Record<Idioma, string>;

export interface Categoria {
  id: string;
  nombre: Bilingue;
  descripcion: Bilingue;
  icono: string;
  orden: number;
}

export interface CaracteristicaBilingue {
  clave: Bilingue;
  valor: Bilingue;
}

export interface Producto {
  sku: string;
  /** Parte de la dirección: /producto/<slug>/ */
  slug: string;
  categoria: string;
  nombre: Bilingue;
  marca: string;
  precio: number;
  precioOferta: number | null;
  /** El precio que se cobra: el de oferta si hay, si no el normal. */
  precioFinal: number;
  disponible: boolean;
  destacado: boolean;
  nuevo: boolean;
  descripcion: Bilingue;
  caracteristicas: CaracteristicaBilingue[];
  fotos: string[];
  ejemplo: boolean;
  /** Fila del CSV (para mensajes). */
  fila: number;
  /** Posición en el CSV: es el orden de «Relevancia». */
  orden: number;
}

export interface Catalogo {
  categorias: Categoria[];
  productos: Producto[];
  hayEjemplos: boolean;
}

export interface Problema {
  archivo: string;
  fila?: number;
  sku?: string;
  campo?: string;
  mensaje: string;
}

export type ResultadoCatalogo =
  | { ok: true; catalogo: Catalogo; avisos: Problema[] }
  | { ok: false; errores: Problema[]; avisos: Problema[] };

export interface EntradaCatalogo {
  productosCsv: string;
  categoriasCsv: string;
  glosarioCsv?: string;
  /** Nombres de archivo que hay en public/productos/. */
  fotosDisponibles: string[];
}

export const ARCHIVO_PRODUCTOS = 'catalogo/productos.csv';
export const ARCHIVO_CATEGORIAS = 'catalogo/categorias.csv';

export const COLUMNAS_PRODUCTOS = [
  'sku',
  'categoria',
  'nombre_es',
  'nombre_en',
  'marca',
  'precio_usd',
  'precio_oferta_usd',
  'disponible',
  'destacado',
  'nuevo',
  'descripcion_es',
  'descripcion_en',
  'caracteristicas',
  'fotos',
  'ejemplo',
] as const;
const OBLIGATORIAS_PRODUCTOS = ['sku', 'categoria', 'nombre_es', 'precio_usd', 'disponible'];

export const COLUMNAS_CATEGORIAS = [
  'id',
  'nombre_es',
  'nombre_en',
  'icono',
  'orden',
  'descripcion_es',
  'descripcion_en',
] as const;
const OBLIGATORIAS_CATEGORIAS = ['id', 'nombre_es', 'nombre_en', 'icono', 'orden'];

// ── Esquemas de una fila ────────────────────────────────────────────────────────────────────────────

const textoOpcional = z
  .string()
  .optional()
  .transform((v) => (v ?? '').trim());

const textoObligatorio = (mensaje: string) =>
  z
    .string()
    .optional()
    .transform((v, ctx) => {
      const t = (v ?? '').trim();
      if (t === '') {
        ctx.addIssue({ code: 'custom', message: mensaje });
        return z.NEVER;
      }
      return t;
    });

const siNo = (obligatorio: boolean) =>
  z
    .string()
    .optional()
    .transform((v, ctx) => {
      const r = leerSiNo(v ?? '');
      if (r === undefined) {
        ctx.addIssue({ code: 'custom', message: 'escribe «sí» o «no»' });
        return z.NEVER;
      }
      if (r === null) {
        if (obligatorio) {
          ctx.addIssue({ code: 'custom', message: 'falta este dato: escribe «sí» o «no»' });
          return z.NEVER;
        }
        return false;
      }
      return r;
    });

const MENSAJE_PRECIO = 'debe ser un número mayor que 0, por ejemplo 129.99';

const precioObligatorio = z
  .string()
  .optional()
  .transform((v, ctx): number => {
    const n = leerPrecio(v ?? '');
    if (n === null) {
      ctx.addIssue({ code: 'custom', message: 'falta el precio (por ejemplo 129.99)' });
      return z.NEVER;
    }
    if (Number.isNaN(n) || n <= 0) {
      ctx.addIssue({ code: 'custom', message: MENSAJE_PRECIO });
      return z.NEVER;
    }
    return n;
  });

const precioOpcional = z
  .string()
  .optional()
  .transform((v, ctx): number | null => {
    const n = leerPrecio(v ?? '');
    if (n === null) return null;
    if (Number.isNaN(n) || n <= 0) {
      ctx.addIssue({ code: 'custom', message: MENSAJE_PRECIO });
      return z.NEVER;
    }
    return n;
  });

const filaProducto = z.object({
  sku: z
    .string()
    .optional()
    .transform((v, ctx) => {
      const sku = (v ?? '').trim().toUpperCase();
      if (sku === '') {
        ctx.addIssue({ code: 'custom', message: 'falta el código del producto (SKU)' });
        return z.NEVER;
      }
      if (!/^[A-Z0-9](?:[A-Z0-9-]{0,38}[A-Z0-9])?$/.test(sku)) {
        ctx.addIssue({
          code: 'custom',
          message: 'usa solo letras, números y guiones, sin espacios ni acentos (por ejemplo AZ-ENE-001)',
        });
        return z.NEVER;
      }
      return sku;
    }),
  categoria: textoObligatorio('falta la categoría').transform((c) => c.toLowerCase()),
  nombre_es: textoObligatorio('falta el nombre en español'),
  nombre_en: textoOpcional,
  marca: textoOpcional,
  precio_usd: precioObligatorio,
  precio_oferta_usd: precioOpcional,
  disponible: siNo(true),
  destacado: siNo(false),
  nuevo: siNo(false),
  descripcion_es: textoOpcional,
  descripcion_en: textoOpcional,
  caracteristicas: z
    .string()
    .optional()
    .transform((v, ctx): Caracteristica[] => {
      const { lista, malas } = leerCaracteristicas(v ?? '');
      if (malas.length > 0) {
        ctx.addIssue({
          code: 'custom',
          message: `cada característica va como «clave: valor», separadas por «|». Revisa: ${malas.map((m) => `«${m}»`).join(', ')}`,
        });
        return z.NEVER;
      }
      return lista;
    }),
  fotos: z
    .string()
    .optional()
    .transform((v) => leerLista(v ?? '')),
  ejemplo: siNo(false),
});

const filaCategoria = z.object({
  id: z
    .string()
    .optional()
    .transform((v, ctx) => {
      const id = (v ?? '').trim().toLowerCase();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'usa minúsculas sin acentos, números y guiones (por ejemplo «energia»)',
        });
        return z.NEVER;
      }
      return id;
    }),
  nombre_es: textoObligatorio('falta el nombre en español'),
  nombre_en: textoObligatorio('falta el nombre en inglés'),
  icono: z
    .string()
    .optional()
    .transform((v, ctx) => {
      const icono = (v ?? '').trim();
      if (!esIcono(icono)) {
        ctx.addIssue({
          code: 'custom',
          message: 'no es un ícono conocido (usa: movil, energia, hogar, herramientas, auto, oficina, bicicleta…)',
        });
        return z.NEVER;
      }
      return icono;
    }),
  orden: z
    .string()
    .optional()
    .transform((v, ctx) => {
      const n = Number((v ?? '').trim());
      if ((v ?? '').trim() === '' || !Number.isInteger(n)) {
        ctx.addIssue({ code: 'custom', message: 'debe ser un número entero (1, 2, 3…)' });
        return z.NEVER;
      }
      return n;
    }),
  descripcion_es: textoOpcional,
  descripcion_en: textoOpcional,
});

// ── Ayudantes ───────────────────────────────────────────────────────────────────────────────────────

function revisarColumnas(
  tabla: TablaCsv,
  archivo: string,
  esperadas: readonly string[],
  obligatorias: string[],
  errores: Problema[],
  avisos: Problema[],
): boolean {
  const faltan = obligatorias.filter((c) => !tabla.columnas.includes(c));
  if (faltan.length > 0) {
    errores.push({
      archivo,
      fila: 1,
      mensaje: `faltan columnas en el encabezado: ${faltan.join(', ')}. El encabezado completo es: ${esperadas.join(', ')}`,
    });
    return false;
  }
  for (const columna of tabla.columnas.filter((c) => !esperadas.includes(c))) {
    avisos.push({ archivo, fila: 1, campo: columna, mensaje: 'columna desconocida; se ignora' });
  }
  return true;
}

function erroresDeZod(error: z.ZodError, archivo: string, fila: FilaCsv, sku?: string): Problema[] {
  return error.issues.map((issue) => ({
    archivo,
    fila: fila.numero,
    ...(sku ? { sku } : {}),
    campo: String(issue.path[0] ?? ''),
    mensaje: issue.message,
  }));
}

function leerTabla(texto: string, archivo: string, errores: Problema[]): TablaCsv | null {
  if (pareceMalCodificado(texto)) {
    errores.push({
      archivo,
      mensaje:
        'el archivo no está guardado en UTF-8 y los acentos salen dañados. En Excel: Archivo › Guardar como › «CSV UTF-8 (delimitado por comas)».',
    });
    return null;
  }
  try {
    return leerCsv(texto);
  } catch (e) {
    errores.push({ archivo, mensaje: `no se pudo leer el CSV: ${(e as Error).message}` });
    return null;
  }
}

// ── Catálogo ────────────────────────────────────────────────────────────────────────────────────────

export function construirCatalogo(entrada: EntradaCatalogo): ResultadoCatalogo {
  const errores: Problema[] = [];
  const avisos: Problema[] = [];
  const traductor = crearTraductor(entrada.glosarioCsv ?? '');

  // Categorías
  const categorias: Categoria[] = [];
  const tablaCategorias = leerTabla(entrada.categoriasCsv, ARCHIVO_CATEGORIAS, errores);
  if (
    tablaCategorias &&
    revisarColumnas(tablaCategorias, ARCHIVO_CATEGORIAS, COLUMNAS_CATEGORIAS, OBLIGATORIAS_CATEGORIAS, errores, avisos)
  ) {
    const vistas = new Map<string, number>();
    for (const fila of tablaCategorias.filas) {
      const r = filaCategoria.safeParse(fila.valores);
      if (!r.success) {
        errores.push(...erroresDeZod(r.error, ARCHIVO_CATEGORIAS, fila));
        continue;
      }
      const c = r.data;
      const anterior = vistas.get(c.id);
      if (anterior !== undefined) {
        errores.push({
          archivo: ARCHIVO_CATEGORIAS,
          fila: fila.numero,
          campo: 'id',
          mensaje: `la categoría «${c.id}» ya está en la fila ${anterior}`,
        });
        continue;
      }
      vistas.set(c.id, fila.numero);
      categorias.push({
        id: c.id,
        nombre: { es: c.nombre_es, en: c.nombre_en },
        descripcion: { es: c.descripcion_es, en: c.descripcion_en || c.descripcion_es },
        icono: c.icono,
        orden: c.orden,
      });
    }
  }
  categorias.sort((a, b) => a.orden - b.orden);
  const idsCategorias = new Set(categorias.map((c) => c.id));

  // Productos
  const productos: Producto[] = [];
  const tablaProductos = leerTabla(entrada.productosCsv, ARCHIVO_PRODUCTOS, errores);
  if (
    tablaProductos &&
    revisarColumnas(tablaProductos, ARCHIVO_PRODUCTOS, COLUMNAS_PRODUCTOS, OBLIGATORIAS_PRODUCTOS, errores, avisos)
  ) {
    const skusVistos = new Map<string, number>();
    for (const fila of tablaProductos.filas) {
      const skuCrudo = (fila.valores.sku ?? '').trim().toUpperCase() || undefined;
      let filaValida = true;
      if (skuCrudo) {
        const repetido = skusVistos.get(skuCrudo);
        if (repetido !== undefined) {
          errores.push({
            archivo: ARCHIVO_PRODUCTOS,
            fila: fila.numero,
            sku: skuCrudo,
            campo: 'sku',
            mensaje: `el SKU ya está en la fila ${repetido}`,
          });
          filaValida = false;
        } else {
          skusVistos.set(skuCrudo, fila.numero);
        }
      }

      const r = filaProducto.safeParse(fila.valores);
      if (!r.success) {
        errores.push(...erroresDeZod(r.error, ARCHIVO_PRODUCTOS, fila, skuCrudo));
        continue;
      }
      const p = r.data;
      const donde = { archivo: ARCHIVO_PRODUCTOS, fila: fila.numero, sku: p.sku };

      if (tablaCategorias && !idsCategorias.has(p.categoria)) {
        errores.push({
          ...donde,
          campo: 'categoria',
          mensaje: `«${p.categoria}» no está en categorias.csv. Usa una de estas: ${[...idsCategorias].join(', ')}`,
        });
        filaValida = false;
      }

      if (p.precio_oferta_usd !== null && p.precio_oferta_usd >= p.precio_usd) {
        errores.push({
          ...donde,
          campo: 'precio_oferta_usd',
          mensaje: `el precio de oferta (${p.precio_oferta_usd}) debe ser menor que el precio normal (${p.precio_usd}); si no hay oferta, déjalo vacío`,
        });
        filaValida = false;
      }

      const { fotos, faltantes } = resolverFotos(p.sku, p.fotos, entrada.fotosDisponibles);
      for (const falta of faltantes) {
        errores.push({ ...donde, campo: 'fotos', mensaje: `no encuentro la foto public/productos/${falta}` });
        filaValida = false;
      }

      if (!filaValida) continue;

      if (p.nombre_en === '') {
        avisos.push({ ...donde, campo: 'nombre_en', mensaje: 'falta el nombre en inglés; se usa el de español' });
      }
      if (p.descripcion_es !== '' && p.descripcion_en === '') {
        avisos.push({
          ...donde,
          campo: 'descripcion_en',
          mensaje: 'falta la descripción en inglés; se usa la de español',
        });
      }

      const caracteristicas: CaracteristicaBilingue[] = p.caracteristicas.map(({ clave, valor }) => {
        const claveEn = traductor.traducir(clave);
        const valorEn = traductor.traducir(valor);
        for (const palabra of [...claveEn.sinTraducir, ...valorEn.sinTraducir]) {
          avisos.push({
            ...donde,
            campo: 'caracteristicas',
            mensaje: `«${palabra}» no está en catalogo/glosario.csv; en inglés sale igual que en español`,
          });
        }
        return {
          clave: { es: unirMiles(clave), en: claveEn.texto },
          valor: { es: unirMiles(valor), en: unirMiles(valorEn.texto) },
        };
      });

      productos.push({
        sku: p.sku,
        slug: p.sku.toLowerCase(),
        categoria: p.categoria,
        nombre: { es: unirMiles(p.nombre_es), en: unirMiles(p.nombre_en || p.nombre_es) },
        marca: p.marca,
        precio: p.precio_usd,
        precioOferta: p.precio_oferta_usd,
        precioFinal: p.precio_oferta_usd ?? p.precio_usd,
        disponible: p.disponible,
        destacado: p.destacado,
        nuevo: p.nuevo,
        descripcion: { es: p.descripcion_es, en: p.descripcion_en || p.descripcion_es },
        caracteristicas,
        fotos,
        ejemplo: p.ejemplo,
        fila: fila.numero,
        orden: productos.length,
      });
    }
    if (tablaProductos.filas.length === 0) {
      errores.push({ archivo: ARCHIVO_PRODUCTOS, mensaje: 'no hay ningún producto' });
    }
  }

  if (errores.length > 0) return { ok: false, errores, avisos };
  return {
    ok: true,
    avisos,
    catalogo: { categorias, productos, hayEjemplos: productos.some((p) => p.ejemplo) },
  };
}

/** Una línea por problema: «catalogo/productos.csv · fila 7 · AZ-ENE-003 · precio_usd: debe ser…». */
export function describirProblema(p: Problema): string {
  const partes = [p.archivo];
  if (p.fila !== undefined) partes.push(`fila ${p.fila}`);
  if (p.sku) partes.push(p.sku);
  const lugar = partes.join(' · ');
  return p.campo ? `${lugar} · ${p.campo}: ${p.mensaje}` : `${lugar}: ${p.mensaje}`;
}

export class ErrorDeCatalogo extends Error {
  constructor(public readonly errores: Problema[]) {
    super(
      `El catálogo tiene ${errores.length} ${errores.length === 1 ? 'error' : 'errores'}; no se publica nada hasta corregirlo:\n` +
        errores.map((e) => `  ✗ ${describirProblema(e)}`).join('\n'),
    );
    this.name = 'ErrorDeCatalogo';
  }
}
