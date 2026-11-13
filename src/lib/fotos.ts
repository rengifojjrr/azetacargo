/** Fotos de productos: viven en public/productos/ con el nombre <sku>-1.jpg, <sku>-2.jpg, etc. */

export const CARPETA_FOTOS = 'productos';
export const EXTENSIONES_FOTO = ['jpg', 'jpeg', 'png', 'webp'] as const;
/** Anchos de las copias WebP que se generan al compilar. */
export const ANCHOS_FOTO = [480, 960] as const;
/** Ancho máximo con el que se publica la foto original. */
export const ANCHO_MAXIMO_ORIGINAL = 1600;

const PATRON_VARIANTE = new RegExp(`-(${ANCHOS_FOTO.join('|')})\\.webp$`, 'i');

/** ¿Es un archivo de foto original (no una copia generada)? */
export function esFoto(nombre: string): boolean {
  const extension = nombre.split('.').pop()?.toLowerCase() ?? '';
  return (
    !nombre.startsWith('.') &&
    (EXTENSIONES_FOTO as readonly string[]).includes(extension) &&
    !PATRON_VARIANTE.test(nombre)
  );
}

/** Nombres de las copias WebP de una foto: «AZ-1-1.jpg» → «AZ-1-1-480.webp», «AZ-1-1-960.webp». */
export function variantesWebp(nombre: string): { ancho: number; archivo: string }[] {
  const base = nombre.replace(/\.[^.]+$/, '');
  return ANCHOS_FOTO.map((ancho) => ({ ancho, archivo: `${base}-${ancho}.webp` }));
}

function escaparRegExp(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Decide qué fotos lleva un producto.
 * - Si la columna «fotos» trae nombres, se usan esos (sin importar mayúsculas) y se avisa de los que no existen.
 * - Si está vacía, se toman solas las fotos que se llamen <sku>-1.jpg, <sku>-2.jpg… en orden.
 */
export function resolverFotos(
  sku: string,
  listadas: string[],
  archivos: string[],
): { fotos: string[]; faltantes: string[] } {
  const porNombre = new Map(archivos.filter(esFoto).map((a) => [a.toLowerCase(), a] as const));
  if (listadas.length > 0) {
    const fotos: string[] = [];
    const faltantes: string[] = [];
    for (const nombre of listadas) {
      const real = porNombre.get(nombre.toLowerCase());
      if (real) fotos.push(real);
      else faltantes.push(nombre);
    }
    return { fotos, faltantes };
  }
  const patron = new RegExp(`^${escaparRegExp(sku)}-(\\d+)\\.(${EXTENSIONES_FOTO.join('|')})$`, 'i');
  const fotos = [...porNombre.values()]
    .map((archivo) => ({ archivo, n: Number(patron.exec(archivo)?.[1] ?? Number.NaN) }))
    .filter((f) => Number.isFinite(f.n))
    .sort((a, b) => a.n - b.n)
    .map((f) => f.archivo);
  return { fotos, faltantes: [] };
}
