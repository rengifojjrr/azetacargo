/**
 * Índice JSON del catálogo que se genera al compilar (/indice.json). Lo usan el buscador del catálogo
 * y el carrito, sin servidor. Lleva los textos de búsqueda ya normalizados.
 */
import type { Catalogo, Idioma } from './catalogo.ts';
import type { TextoBusqueda } from './filtros.ts';
import { normalizar } from './texto.ts';

export interface ProductoIndice {
  sku: string;
  slug: string;
  categoria: string;
  nombre: Record<Idioma, string>;
  marca: string;
  precio: number;
  precioOferta: number | null;
  precioFinal: number;
  disponible: boolean;
  /** Dirección de la imagen principal (foto o dibujo). */
  imagen: string;
  busqueda: Record<Idioma, TextoBusqueda>;
}

export interface Indice {
  version: 1;
  productos: ProductoIndice[];
}

export function construirIndice(catalogo: Catalogo, imagen: (sku: string) => string): Indice {
  const categorias = new Map(catalogo.categorias.map((c) => [c.id, c]));
  return {
    version: 1,
    productos: catalogo.productos.map((p) => {
      const categoria = categorias.get(p.categoria);
      const busqueda = (idioma: Idioma): TextoBusqueda => ({
        nombre: normalizar(p.nombre[idioma]),
        resto: normalizar(
          [
            p.sku,
            p.marca,
            categoria?.nombre[idioma] ?? '',
            p.descripcion[idioma],
            ...p.caracteristicas.map((c) => `${c.clave[idioma]} ${c.valor[idioma]}`),
          ].join(' '),
        ),
      });
      return {
        sku: p.sku,
        slug: p.slug,
        categoria: p.categoria,
        nombre: p.nombre,
        marca: p.marca,
        precio: p.precio,
        precioOferta: p.precioOferta,
        precioFinal: p.precioFinal,
        disponible: p.disponible,
        imagen: imagen(p.sku),
        busqueda: { es: busqueda('es'), en: busqueda('en') },
      };
    }),
  };
}
