import type { APIRoute } from 'astro';
import { construirIndice } from '../lib/indice.ts';
import { imagenesDe, obtenerCatalogo } from '../lib/sitio.ts';

export const GET: APIRoute = () => {
  const catalogo = obtenerCatalogo();
  const porSku = new Map(catalogo.productos.map((p) => [p.sku, p]));
  const indice = construirIndice(catalogo, (sku) => {
    const producto = porSku.get(sku);
    return producto ? (imagenesDe(producto)[0]?.src ?? '') : '';
  });
  return new Response(JSON.stringify(indice), { headers: { 'Content-Type': 'application/json' } });
};
