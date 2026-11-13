import { describe, expect, it } from 'vitest';
import { detectarSeparador, leerCsv, normalizarColumna, pareceMalCodificado } from '../../src/lib/csv.ts';
import { esFoto, resolverFotos, variantesWebp } from '../../src/lib/fotos.ts';
import { crearTraductor } from '../../src/lib/glosario.ts';

describe('csv', () => {
  it('detecta el separador por el encabezado', () => {
    expect(detectarSeparador('a,b,c\n1;2,3')).toBe(',');
    expect(detectarSeparador('a;b;c\n1,5;2;3')).toBe(';');
  });

  it('normaliza nombres de columna', () => {
    expect(normalizarColumna(' Precio USD ')).toBe('precio_usd');
    expect(normalizarColumna('Ícono')).toBe('icono');
    expect(normalizarColumna('descripción_es')).toBe('descripcion_es');
  });

  it('lee con BOM, comillas, saltos de línea y conserva el número de fila de Excel', () => {
    const texto = '﻿sku,nombre\nA-1,"Uno, dos"\n,\nA-2,"Línea 1\nLínea 2"\n\nA-3,Tres\n';
    const tabla = leerCsv(texto);
    expect(tabla.columnas).toEqual(['sku', 'nombre']);
    expect(tabla.filas.map((f) => [f.numero, f.valores.sku, f.valores.nombre])).toEqual([
      [2, 'A-1', 'Uno, dos'],
      [4, 'A-2', 'Línea 1\nLínea 2'],
      [6, 'A-3', 'Tres'],
    ]);
  });

  it('lee CSV con punto y coma (Excel en español)', () => {
    const tabla = leerCsv('sku;precio_usd\nA-1;1299,99\n');
    expect(tabla.filas[0]?.valores).toEqual({ sku: 'A-1', precio_usd: '1299,99' });
  });

  it('reconoce archivos que no están en UTF-8', () => {
    expect(pareceMalCodificado('Colch�n')).toBe(true);
    expect(pareceMalCodificado('Colchón')).toBe(false);
  });
});

describe('fotos', () => {
  const archivos = ['AZ-ENE-001-2.jpg', 'az-ene-001-1.JPG', 'AZ-ENE-001-10.png', 'otra.jpg', '.DS_Store', 'AZ-ENE-001-1-480.webp'];

  it('distingue fotos de copias generadas y archivos ocultos', () => {
    expect(esFoto('a.jpg')).toBe(true);
    expect(esFoto('a.JPEG')).toBe(true);
    expect(esFoto('a-480.webp')).toBe(false);
    expect(esFoto('.DS_Store')).toBe(false);
    expect(esFoto('notas.txt')).toBe(false);
  });

  it('encuentra solas las fotos <sku>-N en orden, sin importar mayúsculas', () => {
    expect(resolverFotos('AZ-ENE-001', [], archivos)).toEqual({
      fotos: ['az-ene-001-1.JPG', 'AZ-ENE-001-2.jpg', 'AZ-ENE-001-10.png'],
      faltantes: [],
    });
    expect(resolverFotos('AZ-ENE-002', [], archivos)).toEqual({ fotos: [], faltantes: [] });
  });

  it('usa las fotos listadas y avisa de las que faltan', () => {
    expect(resolverFotos('AZ-ENE-001', ['OTRA.jpg', 'no-existe.jpg'], archivos)).toEqual({
      fotos: ['otra.jpg'],
      faltantes: ['no-existe.jpg'],
    });
  });

  it('nombra las copias WebP', () => {
    expect(variantesWebp('AZ-1-1.jpg')).toEqual([
      { ancho: 480, archivo: 'AZ-1-1-480.webp' },
      { ancho: 960, archivo: 'AZ-1-1-960.webp' },
    ]);
  });
});

describe('glosario', () => {
  const traductor = crearTraductor('es,en\nCapacidad,Capacity\nNegro,Black\npulgadas,in\nbaterías,batteries\nde,of\n');

  it('traduce el texto completo o palabra por palabra', () => {
    expect(traductor.traducir('Capacidad')).toEqual({ texto: 'Capacity', sinTraducir: [] });
    expect(traductor.traducir('negro')).toEqual({ texto: 'Black', sinTraducir: [] });
    expect(traductor.traducir('16 pulgadas')).toEqual({ texto: '16 in', sinTraducir: [] });
    expect(traductor.traducir('2 baterias de 2 Ah')).toEqual({ texto: '2 batteries of 2 Ah', sinTraducir: [] });
  });

  it('pasa los números a formato inglés y avisa de palabras sin traducción', () => {
    expect(traductor.traducir('1 000 Wh')).toEqual({ texto: '1,000 Wh', sinTraducir: [] });
    expect(traductor.traducir('Acero inoxidable USB-C')).toEqual({
      texto: 'Acero inoxidable USB-C',
      sinTraducir: ['Acero', 'inoxidable'],
    });
  });
});
