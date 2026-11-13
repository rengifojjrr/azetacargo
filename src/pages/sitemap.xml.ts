import type { APIRoute } from 'astro';
import { obtenerCatalogo } from '../lib/sitio.ts';
import { ruta, type Pagina } from '../i18n/rutas.ts';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://azetacargo.com');
  const { categorias, productos } = obtenerCatalogo();
  const paginas: { pagina: Pagina; parametro?: string }[] = [
    ...(['inicio', 'tienda', 'mayoreo', 'envios', 'nosotros', 'contacto', 'preguntas', 'terminos', 'privacidad'] as const).map(
      (pagina) => ({ pagina }),
    ),
    ...categorias.map((c) => ({ pagina: 'categoria' as const, parametro: c.id })),
    ...productos.map((p) => ({ pagina: 'producto' as const, parametro: p.slug })),
  ];
  const url = (idioma: 'es' | 'en', pagina: Pagina, parametro?: string) => new URL(ruta(idioma, pagina, parametro), base).href;
  const entradas = paginas.flatMap(({ pagina, parametro }) =>
    (['es', 'en'] as const).map(
      (idioma) => `  <url>
    <loc>${url(idioma, pagina, parametro)}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${url('es', pagina, parametro)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${url('en', pagina, parametro)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url('es', pagina, parametro)}"/>
  </url>`,
    ),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entradas.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
