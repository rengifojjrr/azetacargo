import { describe, expect, it } from 'vitest';
import {
  contarMarcas,
  CRITERIOS_VACIOS,
  criteriosAUrl,
  criteriosDesdeUrl,
  filtrar,
  hayFiltros,
  puntaje,
  type ProductoFiltrable,
  type TextoBusqueda,
} from '../../src/lib/filtros.ts';
import { normalizar } from '../../src/lib/texto.ts';
import { crearRutas } from '../../src/i18n/rutas.ts';

const productos: ProductoFiltrable[] = [
  { sku: 'T1', categoria: 'herramientas', marca: 'Marca D', precio: 99, disponible: true, nuevo: false, destacado: true, orden: 0 },
  { sku: 'T2', categoria: 'herramientas', marca: 'Marca D', precio: 149, disponible: true, nuevo: true, destacado: false, orden: 1 },
  { sku: 'T3', categoria: 'herramientas', marca: 'Marca B', precio: 19.99, disponible: true, nuevo: false, destacado: false, orden: 2 },
  { sku: 'T4', categoria: 'herramientas', marca: 'Marca D', precio: 139, disponible: false, nuevo: false, destacado: false, orden: 3 },
  { sku: 'T5', categoria: 'herramientas', marca: 'Marca E', precio: 109, disponible: true, nuevo: false, destacado: false, orden: 4 },
];

const texto = (nombre: string, resto = ''): TextoBusqueda => ({ nombre: normalizar(nombre), resto: normalizar(resto) });
const textos = new Map<string, TextoBusqueda>([
  ['T1', texto('Taladro inalámbrico 20 V con 2 baterías', 'Marca D herramientas')],
  ['T2', texto('Taladro percutor inalámbrico 20 V', 'concreto ladrillo')],
  ['T3', texto('Juego de brocas, 30 piezas', 'Brocas para taladro: metal, madera y concreto')],
  ['T4', texto('Sierra circular inalámbrica 20 V', 'madera')],
  ['T5', texto('Atornillador de impacto inalámbrico 20 V', 'tornillos')],
]);
const skus = (lista: ProductoFiltrable[]) => lista.map((p) => p.sku);

describe('filtros del catálogo', () => {
  it('por defecto: destacados primero, luego el orden del CSV y los agotados al final', () => {
    expect(skus(filtrar(productos, CRITERIOS_VACIOS))).toEqual(['T1', 'T2', 'T3', 'T5', 'T4']);
  });

  it('filtra por marca, precio y disponibilidad', () => {
    expect(skus(filtrar(productos, { ...CRITERIOS_VACIOS, marcas: ['Marca D'] }))).toEqual(['T1', 'T2', 'T4']);
    expect(skus(filtrar(productos, { ...CRITERIOS_VACIOS, min: 100, max: 140 }))).toEqual(['T5', 'T4']);
    expect(skus(filtrar(productos, { ...CRITERIOS_VACIOS, soloDisponibles: true }))).toEqual(['T1', 'T2', 'T3', 'T5']);
  });

  it('ordena por precio y por novedad', () => {
    expect(skus(filtrar(productos, { ...CRITERIOS_VACIOS, orden: 'precio-asc' }))).toEqual(['T3', 'T1', 'T5', 'T2', 'T4']);
    expect(skus(filtrar(productos, { ...CRITERIOS_VACIOS, orden: 'precio-desc' }))).toEqual(['T2', 'T5', 'T1', 'T3', 'T4']);
    expect(skus(filtrar(productos, { ...CRITERIOS_VACIOS, orden: 'nuevo' }))[0]).toBe('T2');
  });

  it('busca sin acentos, con plurales y da más peso al nombre', () => {
    expect(skus(filtrar(productos, { ...CRITERIOS_VACIOS, q: 'taladros' }, textos))).toEqual(['T1', 'T2', 'T3']);
    expect(skus(filtrar(productos, { ...CRITERIOS_VACIOS, q: 'INALÁMBRICO percutor' }, textos))).toEqual(['T2']);
    expect(skus(filtrar(productos, { ...CRITERIOS_VACIOS, q: 'nada parecido' }, textos))).toEqual([]);
    expect(puntaje(textos.get('T3'), ['broca'])).toBeGreaterThan(puntaje(textos.get('T3'), ['taladro']));
  });

  it('cuenta marcas sin aplicar el filtro de marca', () => {
    const conteo = contarMarcas(productos, { ...CRITERIOS_VACIOS, marcas: ['Marca B'], soloDisponibles: true });
    expect(Object.fromEntries(conteo)).toEqual({ 'Marca D': 2, 'Marca B': 1, 'Marca E': 1 });
  });

  it('lee y escribe los criterios en la dirección', () => {
    const params = new URLSearchParams('q=taladro&marca=Marca+D&marca=Marca+E&min=10&max=abc&disponible=1&orden=precio-desc');
    const c = criteriosDesdeUrl(params);
    expect(c).toEqual({
      q: 'taladro',
      marcas: ['Marca D', 'Marca E'],
      min: 10,
      max: null,
      soloDisponibles: true,
      orden: 'precio-desc',
    });
    expect(criteriosAUrl(c).toString()).toBe('q=taladro&marca=Marca+D&marca=Marca+E&min=10&disponible=1&orden=precio-desc');
    expect(criteriosAUrl(CRITERIOS_VACIOS).toString()).toBe('');
    expect(criteriosDesdeUrl(new URLSearchParams('orden=raro')).orden).toBe('relevancia');
    expect(hayFiltros(c)).toBe(true);
    expect(hayFiltros({ ...CRITERIOS_VACIOS, q: 'x' })).toBe(false);
  });
});

describe('rutas en dos idiomas', () => {
  it('funciona bajo /azetacargo/ (GitHub Pages)', () => {
    const { ruta, recurso } = crearRutas('/azetacargo');
    expect(ruta('es', 'inicio')).toBe('/azetacargo/');
    expect(ruta('en', 'inicio')).toBe('/azetacargo/en/');
    expect(ruta('es', 'tienda')).toBe('/azetacargo/tienda/');
    expect(ruta('en', 'categoria', 'energia')).toBe('/azetacargo/en/shop/energia/');
    expect(ruta('es', 'producto', 'az-ene-001')).toBe('/azetacargo/producto/az-ene-001/');
    expect(ruta('en', 'preguntas')).toBe('/azetacargo/en/faq/');
    expect(recurso('/productos/a.jpg')).toBe('/azetacargo/productos/a.jpg');
  });

  it('funciona en la raíz del dominio', () => {
    const { ruta, recurso } = crearRutas('/');
    expect(ruta('es', 'inicio')).toBe('/');
    expect(ruta('es', 'mayoreo')).toBe('/mayoreo/');
    expect(ruta('en', 'carrito')).toBe('/en/cart/');
    expect(recurso('indice.json')).toBe('/indice.json');
  });
});
