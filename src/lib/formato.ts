const dolares = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** 1299 → «$1,299.00». Los precios del sitio siempre van en dólares con formato de EE. UU. */
export function formatearPrecio(valor: number): string {
  return dolares.format(valor);
}
