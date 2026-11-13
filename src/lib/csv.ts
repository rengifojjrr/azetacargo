import { parse } from 'csv-parse/sync';
import { normalizar } from './texto.ts';

export interface FilaCsv {
  /** Número de fila tal como lo muestra Excel (el encabezado es la fila 1). */
  numero: number;
  valores: Record<string, string>;
}

export interface TablaCsv {
  columnas: string[];
  filas: FilaCsv[];
}

/** Excel en español guarda con «;» y en inglés con «,». Se decide mirando el encabezado. */
export function detectarSeparador(texto: string): ',' | ';' {
  const encabezado = texto.split(/\r?\n/, 1)[0] ?? '';
  const comas = encabezado.split(',').length - 1;
  const puntoYComa = encabezado.split(';').length - 1;
  return puntoYComa > comas ? ';' : ',';
}

/** «Precio USD» → «precio_usd», «Ícono» → «icono». */
export function normalizarColumna(nombre: string): string {
  return normalizar(nombre).replace(/ /g, '_');
}

/** El texto tiene caracteres «�»: el archivo no se guardó en UTF-8. */
export function pareceMalCodificado(texto: string): boolean {
  return texto.includes('�');
}

/**
 * Lee un CSV (con o sin BOM, con «,» o «;»). Las filas totalmente vacías se ignoran, pero los números
 * de fila siguen siendo los de Excel para que los mensajes de error apunten a la fila correcta.
 */
export function leerCsv(texto: string): TablaCsv {
  const limpio = texto.replace(/^﻿/, '');
  const registros = parse(limpio, {
    delimiter: detectarSeparador(limpio),
    relax_column_count: true,
    skip_empty_lines: false,
    trim: true,
  }) as string[][];

  const [encabezado = [], ...resto] = registros;
  const columnas = encabezado.map(normalizarColumna);
  const filas: FilaCsv[] = [];
  resto.forEach((registro, indice) => {
    const valores: Record<string, string> = {};
    columnas.forEach((columna, j) => {
      if (columna !== '') valores[columna] = (registro[j] ?? '').trim();
    });
    if (Object.values(valores).some((v) => v !== '')) {
      filas.push({ numero: indice + 2, valores });
    }
  });
  return { columnas: columnas.filter((c) => c !== ''), filas };
}
