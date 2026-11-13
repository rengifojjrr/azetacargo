/**
 * Filtros, orden y búsqueda del catálogo. Funciones puras: las usa el navegador sobre las tarjetas
 * ya publicadas y las pruebas sobre datos de ejemplo.
 */
import { palabrasDeBusqueda } from './texto.ts';

export const ORDENES = ['relevancia', 'precio-asc', 'precio-desc', 'nuevo'] as const;
export type Orden = (typeof ORDENES)[number];

export interface ProductoFiltrable {
  sku: string;
  categoria: string;
  marca: string;
  /** Precio que se cobra (el de oferta si hay). */
  precio: number;
  disponible: boolean;
  nuevo: boolean;
  destacado: boolean;
  /** Posición en el CSV. */
  orden: number;
}

/** Texto normalizado de un producto para buscar: el nombre pesa más que el resto. */
export interface TextoBusqueda {
  nombre: string;
  resto: string;
}

export interface Criterios {
  q: string;
  marcas: string[];
  min: number | null;
  max: number | null;
  soloDisponibles: boolean;
  orden: Orden;
}

export const CRITERIOS_VACIOS: Criterios = {
  q: '',
  marcas: [],
  min: null,
  max: null,
  soloDisponibles: false,
  orden: 'relevancia',
};

function numeroOpcional(valor: string | null): number | null {
  if (valor === null || valor.trim() === '') return null;
  const n = Number(valor.replace(/[$,\s]/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function criteriosDesdeUrl(params: URLSearchParams): Criterios {
  const orden = params.get('orden') ?? '';
  return {
    q: (params.get('q') ?? '').trim().slice(0, 100),
    marcas: params.getAll('marca').filter((m) => m.trim() !== ''),
    min: numeroOpcional(params.get('min')),
    max: numeroOpcional(params.get('max')),
    soloDisponibles: params.get('disponible') === '1',
    orden: (ORDENES as readonly string[]).includes(orden) ? (orden as Orden) : 'relevancia',
  };
}

export function criteriosAUrl(c: Criterios): URLSearchParams {
  const params = new URLSearchParams();
  if (c.q) params.set('q', c.q);
  for (const marca of c.marcas) params.append('marca', marca);
  if (c.min !== null) params.set('min', String(c.min));
  if (c.max !== null) params.set('max', String(c.max));
  if (c.soloDisponibles) params.set('disponible', '1');
  if (c.orden !== 'relevancia') params.set('orden', c.orden);
  return params;
}

export function hayFiltros(c: Criterios): boolean {
  return c.marcas.length > 0 || c.min !== null || c.max !== null || c.soloDisponibles;
}

/** 0 si no coincide. Todas las palabras deben aparecer; las que están en el nombre suman más. */
export function puntaje(texto: TextoBusqueda | undefined, palabras: string[]): number {
  if (palabras.length === 0) return 1;
  if (!texto) return 0;
  let total = 0;
  for (const palabra of palabras) {
    if (texto.nombre.includes(palabra)) {
      total += 3;
      if (` ${texto.nombre}`.includes(` ${palabra}`)) total += 1;
    } else if (texto.resto.includes(palabra)) {
      total += 1;
    } else {
      return 0;
    }
  }
  return total;
}

/**
 * Aplica búsqueda, filtros y orden. Los agotados siempre van al final.
 * Con `sinMarca` ignora el filtro de marca (para contar cuántos hay de cada marca).
 */
export function filtrar<T extends ProductoFiltrable>(
  productos: readonly T[],
  c: Criterios,
  textos: ReadonlyMap<string, TextoBusqueda> = new Map(),
  sinMarca = false,
): T[] {
  const palabras = palabrasDeBusqueda(c.q);
  const puntajes = new Map<string, number>();
  const quedan = productos.filter((p) => {
    if (!sinMarca && c.marcas.length > 0 && !c.marcas.includes(p.marca)) return false;
    if (c.min !== null && p.precio < c.min) return false;
    if (c.max !== null && p.precio > c.max) return false;
    if (c.soloDisponibles && !p.disponible) return false;
    const valor = puntaje(textos.get(p.sku), palabras);
    puntajes.set(p.sku, valor);
    return valor > 0;
  });

  const porOrden = (a: T, b: T) => a.orden - b.orden;
  const comparar: Record<Orden, (a: T, b: T) => number> = {
    relevancia: (a, b) =>
      (puntajes.get(b.sku) ?? 0) - (puntajes.get(a.sku) ?? 0) ||
      Number(b.destacado) - Number(a.destacado) ||
      porOrden(a, b),
    'precio-asc': (a, b) => a.precio - b.precio || porOrden(a, b),
    'precio-desc': (a, b) => b.precio - a.precio || porOrden(a, b),
    nuevo: (a, b) => Number(b.nuevo) - Number(a.nuevo) || porOrden(a, b),
  };
  return quedan.sort((a, b) => Number(b.disponible) - Number(a.disponible) || comparar[c.orden](a, b));
}

/** Cuántos productos hay de cada marca con los demás filtros puestos. */
export function contarMarcas<T extends ProductoFiltrable>(
  productos: readonly T[],
  c: Criterios,
  textos?: ReadonlyMap<string, TextoBusqueda>,
): Map<string, number> {
  const cuenta = new Map<string, number>();
  for (const p of filtrar(productos, c, textos, true)) {
    if (p.marca) cuenta.set(p.marca, (cuenta.get(p.marca) ?? 0) + 1);
  }
  return cuenta;
}
