/**
 * Direcciones del sitio en los dos idiomas. Español en la raíz, inglés bajo /en/ con nombres en inglés:
 *   /tienda/energia/  ↔  /en/shop/energia/
 *   /producto/az-ene-001/  ↔  /en/product/az-ene-001/
 */
import type { Idioma } from '../lib/catalogo.ts';

export type Pagina =
  | 'inicio'
  | 'tienda'
  | 'categoria'
  | 'producto'
  | 'carrito'
  | 'mayoreo'
  | 'envios'
  | 'nosotros'
  | 'contacto'
  | 'preguntas'
  | 'terminos'
  | 'privacidad';

const SEGMENTOS: Record<Idioma, Record<Exclude<Pagina, 'categoria'>, string>> = {
  es: {
    inicio: '',
    tienda: 'tienda',
    producto: 'producto',
    carrito: 'carrito',
    mayoreo: 'mayoreo',
    envios: 'envios',
    nosotros: 'nosotros',
    contacto: 'contacto',
    preguntas: 'preguntas-frecuentes',
    terminos: 'terminos',
    privacidad: 'privacidad',
  },
  en: {
    inicio: '',
    tienda: 'shop',
    producto: 'product',
    carrito: 'cart',
    mayoreo: 'wholesale',
    envios: 'shipping',
    nosotros: 'about',
    contacto: 'contact',
    preguntas: 'faq',
    terminos: 'terms',
    privacidad: 'privacy',
  },
};

export function otroIdioma(idioma: Idioma): Idioma {
  return idioma === 'es' ? 'en' : 'es';
}

export function crearRutas(base: string) {
  const raiz = `/${base.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');

  /** Dirección de una página. `parametro` es la categoría o el slug del producto. */
  function ruta(idioma: Idioma, pagina: Pagina, parametro?: string): string {
    const prefijo = idioma === 'en' ? 'en/' : '';
    let camino: string;
    if (pagina === 'categoria') camino = `${SEGMENTOS[idioma].tienda}/${parametro ?? ''}`;
    else if (pagina === 'producto') camino = `${SEGMENTOS[idioma].producto}/${parametro ?? ''}`;
    else camino = SEGMENTOS[idioma][pagina];
    const completo = `${raiz}${prefijo}${camino}`.replace(/\/+$/, '');
    return `${completo}/`;
  }

  /** Dirección de un archivo publicado: recurso('productos/a.jpg') → /azetacargo/productos/a.jpg */
  function recurso(camino: string): string {
    return `${raiz}${camino.replace(/^\/+/, '')}`;
  }

  return { raiz, ruta, recurso };
}

export const { raiz, ruta, recurso } = crearRutas(import.meta.env.BASE_URL ?? '/');
