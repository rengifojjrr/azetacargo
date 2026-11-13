/**
 * Datos que solo existen al compilar el sitio (Astro): el catálogo leído de los CSV, los colores de la marca
 * y las direcciones de las imágenes. No se usa en el navegador.
 */
import { readdirSync } from 'node:fs';
import path from 'node:path';
import categoriasCsv from '../../catalogo/categorias.csv?raw';
import glosarioCsv from '../../catalogo/glosario.csv?raw';
import productosCsv from '../../catalogo/productos.csv?raw';
import tokensCss from '../estilos/tokens.css?raw';
import { recurso } from '../i18n/rutas.ts';
import { construirCatalogo, ErrorDeCatalogo, type Catalogo, type Producto } from './catalogo.ts';
import { CARPETA_FOTOS, esFoto, variantesWebp } from './fotos.ts';
import { leerTokens, valorToken } from './tokens.ts';

function fotosDisponibles(): string[] {
  try {
    return readdirSync(path.join(process.cwd(), 'public', CARPETA_FOTOS)).filter(esFoto);
  } catch {
    return [];
  }
}

let catalogo: Catalogo | undefined;

/** El catálogo validado. Si los CSV tienen errores, la compilación se detiene con la lista completa. */
export function obtenerCatalogo(): Catalogo {
  if (catalogo) return catalogo;
  const resultado = construirCatalogo({
    productosCsv,
    categoriasCsv,
    glosarioCsv,
    fotosDisponibles: fotosDisponibles(),
  });
  if (!resultado.ok) throw new ErrorDeCatalogo(resultado.errores);
  catalogo = resultado.catalogo;
  return catalogo;
}

const tokens = leerTokens(tokensCss);

/** Colores de tokens.css, para SVG sueltos e imágenes generadas. */
export const colores = {
  marino: valorToken(tokens, '--color-marino'),
  tinta: valorToken(tokens, '--color-tinta'),
  gris: valorToken(tokens, '--color-gris'),
  linea: valorToken(tokens, '--color-linea'),
  fondoImagen: valorToken(tokens, '--color-fondo-imagen'),
  blanco: valorToken(tokens, '--color-blanco'),
  turquesa: valorToken(tokens, '--color-turquesa'),
};

export interface Imagen {
  /** «foto» si hay foto real; «ilustracion» si es el dibujo de la categoría. */
  tipo: 'foto' | 'ilustracion';
  src: string;
  /** Copias WebP (solo existen en el sitio compilado). */
  srcsetWebp?: string;
  ancho: number;
  alto: number;
}

export function urlIlustracion(categoria: string): string {
  return recurso(`ilustraciones/${categoria}.svg`);
}

export function imagenesDe(producto: Producto): Imagen[] {
  if (producto.fotos.length === 0) {
    return [{ tipo: 'ilustracion', src: urlIlustracion(producto.categoria), ancho: 400, alto: 300 }];
  }
  return producto.fotos.map((foto) => ({
    tipo: 'foto',
    src: recurso(`${CARPETA_FOTOS}/${foto}`),
    srcsetWebp: import.meta.env.PROD
      ? variantesWebp(foto)
          .map((v) => `${recurso(`${CARPETA_FOTOS}/${v.archivo}`)} ${v.ancho}w`)
          .join(', ')
      : undefined,
    ancho: 800,
    alto: 600,
  }));
}

/** Escapa JSON para meterlo en un <script type="application/ld+json">. */
export function jsonSeguro(datos: unknown): string {
  return JSON.stringify(datos).replace(/</g, '\\u003c');
}
