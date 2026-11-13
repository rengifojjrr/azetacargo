import { describe, expect, it } from 'vitest';
import {
  agregar,
  calcularCarrito,
  CANTIDAD_MAXIMA,
  CARRITO_VACIO,
  fijarCantidad,
  guardarCarrito,
  leerCarrito,
  quitar,
  totalUnidades,
} from '../../src/lib/carrito.ts';

describe('carrito', () => {
  it('agrega, suma y respeta el máximo', () => {
    let c = agregar(CARRITO_VACIO, 'A');
    c = agregar(c, 'B', 2);
    c = agregar(c, 'A', 3);
    expect(c.lineas).toEqual([
      { sku: 'A', cantidad: 4 },
      { sku: 'B', cantidad: 2 },
    ]);
    expect(totalUnidades(c)).toBe(6);
    expect(agregar(c, 'A', 500).lineas[0]?.cantidad).toBe(CANTIDAD_MAXIMA);
  });

  it('fija cantidades y quita con cero', () => {
    let c = agregar(agregar(CARRITO_VACIO, 'A'), 'B');
    c = fijarCantidad(c, 'A', 7.8);
    expect(c.lineas[0]).toEqual({ sku: 'A', cantidad: 7 });
    c = fijarCantidad(c, 'B', 0);
    expect(c.lineas).toEqual([{ sku: 'A', cantidad: 7 }]);
    expect(quitar(c, 'A')).toEqual(CARRITO_VACIO);
    expect(fijarCantidad(c, 'A', Number.NaN)).toEqual(CARRITO_VACIO);
  });

  it('no cambia el carrito original', () => {
    const original = agregar(CARRITO_VACIO, 'A');
    agregar(original, 'A', 5);
    expect(original.lineas).toEqual([{ sku: 'A', cantidad: 1 }]);
  });

  it('guarda y lee, y no falla con datos dañados', () => {
    const c = agregar(agregar(CARRITO_VACIO, 'A', 2), 'B');
    expect(leerCarrito(guardarCarrito(c))).toEqual(c);
    expect(leerCarrito(null)).toEqual(CARRITO_VACIO);
    expect(leerCarrito('{no es json')).toEqual(CARRITO_VACIO);
    expect(leerCarrito('{"v":99,"lineas":[]}')).toEqual(CARRITO_VACIO);
    expect(leerCarrito('{"v":1,"lineas":[{"sku":"A","cantidad":"3"},{"sku":"B","cantidad":2},null,{"sku":"B","cantidad":1}]}')).toEqual({
      lineas: [{ sku: 'B', cantidad: 3 }],
    });
  });

  it('calcula con los precios actuales y separa lo que ya no se puede pedir', () => {
    let c = agregar(CARRITO_VACIO, 'A', 3);
    c = agregar(c, 'B');
    c = agregar(c, 'VIEJO', 2);
    c = agregar(c, 'AGOTADO');
    const precios = new Map([
      ['A', { precioFinal: 19.99, disponible: true }],
      ['B', { precioFinal: 0.1, disponible: true }],
      ['AGOTADO', { precioFinal: 50, disponible: false }],
    ]);
    const r = calcularCarrito(c, precios);
    expect(r.lineas).toEqual([
      { sku: 'A', cantidad: 3, precioUnitario: 19.99, total: 59.97 },
      { sku: 'B', cantidad: 1, precioUnitario: 0.1, total: 0.1 },
    ]);
    expect(r.subtotal).toBe(60.07);
    expect(r.unidades).toBe(4);
    expect(r.retiradas).toEqual([
      { sku: 'VIEJO', cantidad: 2, motivo: 'no-existe' },
      { sku: 'AGOTADO', cantidad: 1, motivo: 'agotado' },
    ]);
  });
});
