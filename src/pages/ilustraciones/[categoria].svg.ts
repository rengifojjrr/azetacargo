import type { APIRoute, GetStaticPaths } from 'astro';
import { svgIlustracion } from '../../lib/ilustraciones.ts';
import { colores, obtenerCatalogo } from '../../lib/sitio.ts';

export const getStaticPaths = (() =>
  obtenerCatalogo().categorias.map((c) => ({ params: { categoria: c.id } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(
    svgIlustracion(params.categoria ?? '', {
      trazo: colores.marino,
      detalle: colores.gris,
      suelo: colores.linea,
      fondo: colores.fondoImagen,
    }),
    { headers: { 'Content-Type': 'image/svg+xml' } },
  );
