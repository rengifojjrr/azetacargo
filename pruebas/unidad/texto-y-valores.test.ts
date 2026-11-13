import { describe, expect, it } from 'vitest';
import {
  aIdentificador,
  normalizar,
  numerosEnIngles,
  palabrasDeBusqueda,
  raiz,
  recortar,
  unirMiles,
} from '../../src/lib/texto.ts';
import { leerCaracteristicas, leerLista, leerPrecio, leerSiNo } from '../../src/lib/valores.ts';

describe('texto', () => {
  it('normaliza acentos, mayúsculas y signos', () => {
    expect(normalizar('  Colchón ORTOPÉDICO, 12"  ')).toBe('colchon ortopedico 12');
    expect(normalizar('Señal ¿Wi-Fi?')).toBe('senal wi fi');
  });

  it('reduce plurales sencillos', () => {
    expect(raiz('taladros')).toBe('taladro');
    expect(raiz('colchones')).toBe('colchon');
    expect(raiz('bicicletas')).toBe('bicicleta');
    expect(raiz('gas')).toBe('gas');
    expect(palabrasDeBusqueda('Taladros  inalámbricos')).toEqual(['taladro', 'inalambrico']);
  });

  it('une los miles con un espacio que no se parte', () => {
    expect(unirMiles('Estación 1 000 Wh')).toBe('Estación 1\u00a0000 Wh');
    expect(unirMiles('20 000 mAh y 2 baterías')).toBe('20\u00a0000 mAh y 2 baterías');
    expect(unirMiles('2 1000')).toBe('2 1000');
  });

  it('pasa números al formato inglés', () => {
    expect(numerosEnIngles('1,5 kg')).toBe('1.5 kg');
    expect(numerosEnIngles('1 000 Wh')).toBe('1,000 Wh');
    expect(numerosEnIngles('2 000,5 W')).toBe('2,000.5 W');
    expect(numerosEnIngles('4 × 120 V')).toBe('4 × 120 V');
  });

  it('crea identificadores y recorta sin partir palabras', () => {
    expect(aIdentificador('Energía y más')).toBe('energia-y-mas');
    expect(recortar('uno dos tres cuatro cinco', 14)).toBe('uno dos tres…');
    expect(recortar('corto', 14)).toBe('corto');
  });
});

describe('valores del CSV', () => {
  it('entiende sí/no escritos de varias formas', () => {
    for (const v of ['sí', 'Si', 'SI', 'x', '1', 'yes']) expect(leerSiNo(v)).toBe(true);
    for (const v of ['no', 'NO', '0', 'n']) expect(leerSiNo(v)).toBe(false);
    expect(leerSiNo('')).toBeNull();
    expect(leerSiNo('tal vez')).toBeUndefined();
  });

  it('entiende precios con formato de EE. UU. y de España', () => {
    expect(leerPrecio('1299')).toBe(1299);
    expect(leerPrecio('1299.99')).toBe(1299.99);
    expect(leerPrecio('$1,299.99')).toBe(1299.99);
    expect(leerPrecio('1,299')).toBe(1299);
    expect(leerPrecio('1.299,99')).toBe(1299.99);
    expect(leerPrecio('1299,99')).toBe(1299.99);
    expect(leerPrecio('1.299')).toBe(1299);
    expect(leerPrecio('US$ 45')).toBe(45);
    expect(leerPrecio('45 USD')).toBe(45);
    expect(leerPrecio('19.9')).toBe(19.9);
    expect(leerPrecio('')).toBeNull();
    expect(leerPrecio('abc')).toBeNaN();
    expect(leerPrecio('12.3.4,5,6')).toBeNaN();
  });

  it('lee listas y características', () => {
    expect(leerLista(' a.jpg | b.jpg ||')).toEqual(['a.jpg', 'b.jpg']);
    expect(leerCaracteristicas('Capacidad: 1 000 Wh | Peso: 11 kg | Hora: 10:30')).toEqual({
      lista: [
        { clave: 'Capacidad', valor: '1 000 Wh' },
        { clave: 'Peso', valor: '11 kg' },
        { clave: 'Hora', valor: '10:30' },
      ],
      malas: [],
    });
    expect(leerCaracteristicas('Capacidad 1 000 Wh | : nada').malas).toEqual(['Capacidad 1 000 Wh', ': nada']);
  });
});
