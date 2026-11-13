import type { APIRoute } from 'astro';
import { esVersionDePrueba } from '../config/negocio.ts';
import { recurso } from '../i18n/rutas.ts';

// Solo cuenta en la raíz del dominio (azetacargo.com/robots.txt). En la versión de prueba no se ofrece
// el mapa del sitio y cada página lleva «noindex».
export const GET: APIRoute = ({ site }) => {
  const lineas = ['User-agent: *', 'Allow: /'];
  if (!esVersionDePrueba && site) lineas.push('', `Sitemap: ${new URL(recurso('sitemap.xml'), site).href}`);
  return new Response(`${lineas.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain' } });
};
