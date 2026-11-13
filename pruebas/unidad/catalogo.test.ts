import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { construirCatalogo, describirProblema, ErrorDeCatalogo, type Problema } from '../../src/lib/catalogo.ts';

const CATEGORIAS = `id,nombre_es,nombre_en,icono,orden,descripcion_es,descripcion_en
energia,Energía,Power,energia,2,"Estaciones, power banks",Power stations
hogar,Hogar,Home,hogar,1,,
`;

const ENCABEZADO =
  'sku,categoria,nombre_es,nombre_en,marca,precio_usd,precio_oferta_usd,disponible,destacado,nuevo,descripcion_es,descripcion_en,caracteristicas,fotos,ejemplo';

function catalogo(filas: string[], extra: Partial<{ fotos: string[]; glosario: string }> = {}) {
  return construirCatalogo({
    productosCsv: [ENCABEZADO, ...filas].join('\n'),
    categoriasCsv: CATEGORIAS,
    glosarioCsv: extra.glosario ?? 'es,en\nCapacidad,Capacity\n',
    fotosDisponibles: extra.fotos ?? [],
  });
}

function errores(r: ReturnType<typeof catalogo>): Problema[] {
  return r.ok ? [] : r.errores;
}

describe('catálogo válido', () => {
  it('arma productos y categorías ordenadas', () => {
    const r = catalogo(
      [
        'az-ene-001,Energia,Estación 1 000 Wh,Power station 1000 Wh,Marca A,699,599,sí,sí,no,Desc,Desc EN,Capacidad: 1 000 Wh,,sí',
        'AZ-HOG-001,hogar,Colchón,,Marca B,"1,299.00",,no,,,,,,,no',
      ],
      { fotos: ['AZ-ENE-001-1.jpg'] },
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const { catalogo: c, avisos } = r;
    expect(c.categorias.map((x) => x.id)).toEqual(['hogar', 'energia']);
    expect(c.categorias[0]?.descripcion).toEqual({ es: '', en: '' });
    const [estacion, colchon] = c.productos;
    expect(estacion).toMatchObject({
      sku: 'AZ-ENE-001',
      slug: 'az-ene-001',
      categoria: 'energia',
      precio: 699,
      precioOferta: 599,
      precioFinal: 599,
      disponible: true,
      destacado: true,
      nuevo: false,
      ejemplo: true,
      fotos: ['AZ-ENE-001-1.jpg'],
      fila: 2,
      orden: 0,
    });
    expect(estacion?.nombre.es).toBe('Estación 1 000 Wh');
    expect(estacion?.caracteristicas).toEqual([
      { clave: { es: 'Capacidad', en: 'Capacity' }, valor: { es: '1 000 Wh', en: '1,000 Wh' } },
    ]);
    expect(colchon).toMatchObject({ precio: 1299, precioOferta: null, disponible: false, destacado: false });
    expect(colchon?.nombre.en).toBe('Colchón');
    expect(c.hayEjemplos).toBe(true);
    expect(avisos.map((a) => a.campo)).toContain('nombre_en');
  });

  it('el catálogo real del repositorio es válido', () => {
    const leer = (ruta: string) => readFileSync(new URL(`../../${ruta}`, import.meta.url), 'utf8');
    const r = construirCatalogo({
      productosCsv: leer('catalogo/productos.csv'),
      categoriasCsv: leer('catalogo/categorias.csv'),
      glosarioCsv: leer('catalogo/glosario.csv'),
      fotosDisponibles: readdirSync(new URL('../../public/productos/', import.meta.url)),
    });
    if (!r.ok) throw new ErrorDeCatalogo(r.errores);
    expect(r.catalogo.productos.length).toBeGreaterThanOrEqual(35);
    expect(r.catalogo.categorias).toHaveLength(7);
    for (const categoria of r.catalogo.categorias) {
      expect(r.catalogo.productos.some((p) => p.categoria === categoria.id)).toBe(true);
    }
    expect(r.avisos.map(describirProblema)).toEqual([]);
  });
});

describe('errores con fila y campo', () => {
  it('dice la fila, el SKU y el campo de cada error', () => {
    const r = catalogo([
      'AZ-1,energia,Uno,One,,abc,,sí,,,,,,,',
      'AZ 2,energia,Dos,Two,,10,,quizás,,,,,,,',
      'AZ-3,cocina,Tres,Three,,10,,sí,,,,,,,',
      'AZ-4,energia,Cuatro,Four,,10,12,sí,,,,,,,',
      'AZ-1,energia,Repetido,Dup,,10,,sí,,,,,,,',
      'AZ-6,energia,Seis,Six,,10,,sí,,,,,Capacidad 1000,,',
      'AZ-7,energia,Siete,Seven,,10,,sí,,,,,,AZ-7-1.jpg,',
      ',energia,,,,,,,,,,,,,',
    ]);
    expect(r.ok).toBe(false);
    const lineas = errores(r).map(describirProblema);
    expect(lineas).toEqual([
      'catalogo/productos.csv · fila 2 · AZ-1 · precio_usd: debe ser un número mayor que 0, por ejemplo 129.99',
      'catalogo/productos.csv · fila 3 · AZ 2 · sku: usa solo letras, números y guiones, sin espacios ni acentos (por ejemplo AZ-ENE-001)',
      'catalogo/productos.csv · fila 3 · AZ 2 · disponible: escribe «sí» o «no»',
      'catalogo/productos.csv · fila 4 · AZ-3 · categoria: «cocina» no está en categorias.csv. Usa una de estas: hogar, energia',
      'catalogo/productos.csv · fila 5 · AZ-4 · precio_oferta_usd: el precio de oferta (12) debe ser menor que el precio normal (10); si no hay oferta, déjalo vacío',
      'catalogo/productos.csv · fila 6 · AZ-1 · sku: el SKU ya está en la fila 2',
      'catalogo/productos.csv · fila 7 · AZ-6 · caracteristicas: cada característica va como «clave: valor», separadas por «|». Revisa: «Capacidad 1000»',
      'catalogo/productos.csv · fila 8 · AZ-7 · fotos: no encuentro la foto public/productos/AZ-7-1.jpg',
      'catalogo/productos.csv · fila 9 · sku: falta el código del producto (SKU)',
      'catalogo/productos.csv · fila 9 · nombre_es: falta el nombre en español',
      'catalogo/productos.csv · fila 9 · precio_usd: falta el precio (por ejemplo 129.99)',
      'catalogo/productos.csv · fila 9 · disponible: falta este dato: escribe «sí» o «no»',
    ]);
  });

  it('avisa si falta una columna obligatoria o el archivo no está en UTF-8', () => {
    const sinPrecio = construirCatalogo({
      productosCsv: 'sku,categoria,nombre_es,disponible\nA,energia,Uno,sí',
      categoriasCsv: CATEGORIAS,
      fotosDisponibles: [],
    });
    expect(errores(sinPrecio).map(describirProblema)[0]).toMatch(/fila 1: faltan columnas en el encabezado: precio_usd/);

    const malCodificado = catalogo(['AZ-1,energia,Colch�n,,,10,,sí,,,,,,,']);
    expect(errores(malCodificado)[0]?.mensaje).toMatch(/UTF-8/);
  });

  it('valida las categorías', () => {
    const r = construirCatalogo({
      productosCsv: `${ENCABEZADO}\nAZ-1,energia,Uno,One,,10,,sí,,,,,,,`,
      categoriasCsv: 'id,nombre_es,nombre_en,icono,orden\nEnergía,Energía,Power,energia,1\nenergia,Energía,,cohete,x\n',
      fotosDisponibles: [],
    });
    expect(errores(r).map(describirProblema)).toEqual([
      'catalogo/categorias.csv · fila 2 · id: usa minúsculas sin acentos, números y guiones (por ejemplo «energia»)',
      'catalogo/categorias.csv · fila 3 · nombre_en: falta el nombre en inglés',
      'catalogo/categorias.csv · fila 3 · icono: no es un ícono conocido (usa: movil, energia, hogar, herramientas, auto, oficina, bicicleta…)',
      'catalogo/categorias.csv · fila 3 · orden: debe ser un número entero (1, 2, 3…)',
      'catalogo/productos.csv · fila 2 · AZ-1 · categoria: «energia» no está en categorias.csv. Usa una de estas: ',
    ]);
  });

  it('el error de catálogo lista todos los problemas', () => {
    const r = catalogo(['AZ-1,energia,Uno,One,,abc,,sí,,,,,,,']);
    if (r.ok) throw new Error('debía fallar');
    const error = new ErrorDeCatalogo(r.errores);
    expect(error.message).toContain('El catálogo tiene 1 error; no se publica nada hasta corregirlo');
    expect(error.message).toContain('fila 2 · AZ-1 · precio_usd');
  });
});
