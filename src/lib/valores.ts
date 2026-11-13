/** Lectura de valores tal como se escriben en Excel: «sí/no», precios con o sin $, listas separadas por «|». */

const VERDADERO = new Set(['si', 'sí', 's', 'yes', 'y', 'x', '1', 'true', 'verdadero']);
const FALSO = new Set(['no', 'n', '0', 'false', 'falso']);

/** «sí» → true, «no» → false, vacío → null. Cualquier otra cosa → undefined (valor inválido). */
export function leerSiNo(valor: string): boolean | null | undefined {
  const v = valor.trim().toLowerCase();
  if (v === '') return null;
  if (VERDADERO.has(v)) return true;
  if (FALSO.has(v)) return false;
  return undefined;
}

/**
 * Lee un precio en dólares. Acepta «1299», «1299.99», «$1,299.99», «1.299,99», «1299,99» y «US$ 45».
 * Devuelve null si está vacío y NaN si no se entiende.
 */
export function leerPrecio(valor: string): number | null {
  let v = valor.trim();
  if (v === '') return null;
  v = v.replace(/^(us\$|usd|\$)\s*/i, '').replace(/\s*(usd|dólares|dolares)$/i, '').replace(/[\s  ]/g, '');
  if (!/^[0-9.,]+$/.test(v)) return Number.NaN;

  const ultimaComa = v.lastIndexOf(',');
  const ultimoPunto = v.lastIndexOf('.');
  let normal: string;
  if (ultimaComa >= 0 && ultimoPunto >= 0) {
    // El separador que aparece de último es el decimal.
    normal = ultimaComa > ultimoPunto ? v.replace(/\./g, '').replace(',', '.') : v.replace(/,/g, '');
  } else if (ultimaComa >= 0) {
    const comas = v.split(',').length - 1;
    normal = comas === 1 && /,\d{1,2}$/.test(v) ? v.replace(',', '.') : v.replace(/,/g, '');
  } else if (ultimoPunto >= 0) {
    const puntos = v.split('.').length - 1;
    // «1.299» o «1.299.000» son miles al estilo español; un precio nunca lleva 3 decimales.
    normal = puntos > 1 || /\.\d{3}$/.test(v) ? v.replace(/\./g, '') : v;
  } else {
    normal = v;
  }
  if (!/^\d+(\.\d+)?$/.test(normal)) return Number.NaN;
  const numero = Number(normal);
  return Number.isFinite(numero) ? Math.round(numero * 100) / 100 : Number.NaN;
}

/** «a | b |c» → ['a', 'b', 'c'] (sin elementos vacíos). */
export function leerLista(valor: string, separador = '|'): string[] {
  return valor
    .split(separador)
    .map((parte) => parte.trim())
    .filter((parte) => parte.length > 0);
}

export interface Caracteristica {
  clave: string;
  valor: string;
}

/**
 * «Capacidad: 1 000 Wh | Peso: 11 kg» → [{clave: 'Capacidad', valor: '1 000 Wh'}, …].
 * Devuelve el texto de cada parte que no tenga «clave: valor» en `malas`.
 */
export function leerCaracteristicas(valor: string): { lista: Caracteristica[]; malas: string[] } {
  const lista: Caracteristica[] = [];
  const malas: string[] = [];
  for (const parte of leerLista(valor)) {
    const dosPuntos = parte.indexOf(':');
    const clave = dosPuntos > 0 ? parte.slice(0, dosPuntos).trim() : '';
    const dato = dosPuntos > 0 ? parte.slice(dosPuntos + 1).trim() : '';
    if (clave === '' || dato === '') malas.push(parte);
    else lista.push({ clave, valor: dato });
  }
  return { lista, malas };
}
