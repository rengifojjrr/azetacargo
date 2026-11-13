/**
 * El carrito, sin navegador: funciones puras que reciben un carrito y devuelven otro.
 * El navegador lo guarda en localStorage (ver src/cliente/almacen.ts).
 */

export const CANTIDAD_MAXIMA = 99;
export const VERSION_CARRITO = 1;

export interface LineaCarrito {
  sku: string;
  cantidad: number;
}

export interface Carrito {
  lineas: LineaCarrito[];
}

export const CARRITO_VACIO: Carrito = { lineas: [] };

function limitar(cantidad: number): number {
  if (!Number.isFinite(cantidad)) return 0;
  return Math.max(0, Math.min(CANTIDAD_MAXIMA, Math.floor(cantidad)));
}

/** Suma `cantidad` unidades de un producto (sin pasar del máximo). */
export function agregar(carrito: Carrito, sku: string, cantidad = 1): Carrito {
  const existente = carrito.lineas.find((l) => l.sku === sku);
  const nueva = limitar((existente?.cantidad ?? 0) + cantidad);
  return fijarCantidad(carrito, sku, nueva);
}

/** Pone la cantidad exacta; con 0 o menos, quita el producto. */
export function fijarCantidad(carrito: Carrito, sku: string, cantidad: number): Carrito {
  const n = limitar(cantidad);
  if (n === 0) return quitar(carrito, sku);
  const existe = carrito.lineas.some((l) => l.sku === sku);
  return {
    lineas: existe
      ? carrito.lineas.map((l) => (l.sku === sku ? { sku, cantidad: n } : l))
      : [...carrito.lineas, { sku, cantidad: n }],
  };
}

export function quitar(carrito: Carrito, sku: string): Carrito {
  return { lineas: carrito.lineas.filter((l) => l.sku !== sku) };
}

export function totalUnidades(carrito: Carrito): number {
  return carrito.lineas.reduce((suma, l) => suma + l.cantidad, 0);
}

/** Lee lo guardado. Si está dañado o es de otra versión, empieza vacío en vez de fallar. */
export function leerCarrito(texto: string | null | undefined): Carrito {
  if (!texto) return CARRITO_VACIO;
  try {
    const datos: unknown = JSON.parse(texto);
    if (typeof datos !== 'object' || datos === null) return CARRITO_VACIO;
    const { v, lineas } = datos as { v?: unknown; lineas?: unknown };
    if (v !== VERSION_CARRITO || !Array.isArray(lineas)) return CARRITO_VACIO;
    let carrito = CARRITO_VACIO;
    for (const linea of lineas) {
      if (typeof linea !== 'object' || linea === null) continue;
      const { sku, cantidad } = linea as { sku?: unknown; cantidad?: unknown };
      if (typeof sku === 'string' && sku.length > 0 && sku.length <= 40 && typeof cantidad === 'number') {
        carrito = agregar(carrito, sku, cantidad);
      }
    }
    return carrito;
  } catch {
    return CARRITO_VACIO;
  }
}

export function guardarCarrito(carrito: Carrito): string {
  return JSON.stringify({ v: VERSION_CARRITO, lineas: carrito.lineas });
}

export interface PrecioProducto {
  precioFinal: number;
  disponible: boolean;
}

export interface LineaCalculada {
  sku: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

export interface CarritoCalculado {
  lineas: LineaCalculada[];
  /** Productos que ya no existen o están agotados: no cuentan para el pedido. */
  retiradas: { sku: string; cantidad: number; motivo: 'no-existe' | 'agotado' }[];
  unidades: number;
  subtotal: number;
}

const centavos = (n: number) => Math.round(n * 100);

/** Precios con los datos actuales del catálogo (no con los del momento en que se agregó). */
export function calcularCarrito(carrito: Carrito, precios: ReadonlyMap<string, PrecioProducto>): CarritoCalculado {
  const lineas: LineaCalculada[] = [];
  const retiradas: CarritoCalculado['retiradas'] = [];
  let subtotalCentavos = 0;
  for (const { sku, cantidad } of carrito.lineas) {
    const producto = precios.get(sku);
    if (!producto) {
      retiradas.push({ sku, cantidad, motivo: 'no-existe' });
      continue;
    }
    if (!producto.disponible) {
      retiradas.push({ sku, cantidad, motivo: 'agotado' });
      continue;
    }
    const totalCentavos = centavos(producto.precioFinal) * cantidad;
    subtotalCentavos += totalCentavos;
    lineas.push({ sku, cantidad, precioUnitario: producto.precioFinal, total: totalCentavos / 100 });
  }
  return {
    lineas,
    retiradas,
    unidades: lineas.reduce((s, l) => s + l.cantidad, 0),
    subtotal: subtotalCentavos / 100,
  };
}
