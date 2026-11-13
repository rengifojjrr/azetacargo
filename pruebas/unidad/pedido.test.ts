import { describe, expect, it } from 'vitest';
import {
  armarMensajeCotizacion,
  armarMensajePedido,
  numeroDePedido,
  numeroWhatsApp,
  urlCorreo,
  urlWhatsApp,
  validarCotizacion,
  validarPedido,
  type DatosCotizacion,
  type DatosPedido,
} from '../../src/lib/pedido.ts';

const datos: DatosPedido = {
  nombre: 'Ana Pérez',
  telefono: '(305) 555-0101',
  correo: 'ana@ejemplo.com',
  entrega: 'eeuu',
  direccion: '100 Calle Ocho, Miami, FL 33135',
  nota: 'Llamar después de las 5',
};

describe('número de pedido', () => {
  it('es la fecha de Miami más 4 letras', () => {
    // 13 nov 2026, 02:00 UTC = 12 nov 2026 en Miami.
    const fecha = new Date('2026-11-13T02:00:00Z');
    const secuencia = [0, 0.999, 0.5, 0.25];
    let i = 0;
    expect(numeroDePedido(fecha, () => secuencia[i++] ?? 0)).toBe('20261112-AZNG');
  });

  it('nunca usa I ni O y siempre tiene el mismo formato', () => {
    for (let n = 0; n < 300; n++) {
      const numero = numeroDePedido(new Date('2026-11-13T15:00:00Z'));
      expect(numero).toMatch(/^20261113-[A-HJ-NP-Z]{4}$/);
    }
  });
});

describe('validación del pedido', () => {
  it('acepta un pedido completo', () => {
    expect(validarPedido(datos, 'es')).toEqual({});
  });

  it('marca cada campo con un mensaje claro', () => {
    const errores = validarPedido(
      { nombre: ' ', telefono: '123', correo: 'ana@', entrega: '', direccion: '', nota: '' },
      'es',
    );
    expect(errores).toEqual({
      nombre: 'Escribe tu nombre.',
      telefono: 'Escribe un teléfono con código de área (al menos 7 números).',
      correo: 'Revisa el correo: debe tener la forma nombre@correo.com.',
      entrega: 'Elige cómo quieres recibir el pedido.',
    });
  });

  it('pide dirección para envíos y destino para Cuba, y no para recoger', () => {
    expect(validarPedido({ ...datos, direccion: '' }, 'es').direccion).toBe('Escribe la dirección de entrega.');
    expect(validarPedido({ ...datos, entrega: 'cuba', direccion: '' }, 'en').direccion).toBe(
      'Enter the destination province and municipality.',
    );
    expect(validarPedido({ ...datos, entrega: 'recoger', direccion: '' }, 'es')).toEqual({});
    expect(validarPedido({ ...datos, correo: '' }, 'es')).toEqual({});
  });
});

describe('mensaje del pedido', () => {
  const lineas = [
    { cantidad: 2, nombre: 'Estación de energía portátil 1 000 Wh', sku: 'AZ-ENE-001', precioUnitario: 599, total: 1198 },
    { cantidad: 1, nombre: 'Power bank 20 000 mAh con USB-C', sku: 'AZ-ENE-005', precioUnitario: 39.99, total: 39.99 },
  ];

  it('arma el texto en español con productos, subtotal y datos', () => {
    const texto = armarMensajePedido({ idioma: 'es', numero: '20261113-KQTZ', lineas, subtotal: 1237.99, datos });
    expect(texto).toBe(
      [
        'Hola, Azeta Cargo. Quiero hacer este pedido:',
        '',
        '*Pedido 20261113-KQTZ*',
        '• Estación de energía portátil 1 000 Wh (AZ-ENE-001)',
        '  2 × $599.00 = $1,198.00',
        '• Power bank 20 000 mAh con USB-C (AZ-ENE-005)',
        '  1 × $39.99 = $39.99',
        '',
        '*Subtotal estimado: $1,237.99*',
        'Precios de referencia en USD; el precio final y la forma de pago se confirman con ustedes.',
        '',
        '*Mis datos*',
        'Nombre: Ana Pérez',
        'Teléfono: (305) 555-0101',
        'Correo: ana@ejemplo.com',
        'Entrega: Envío dentro de EE. UU.',
        'Dirección: 100 Calle Ocho, Miami, FL 33135',
        'Nota: Llamar después de las 5',
      ].join('\n'),
    );
  });

  it('en inglés, sin correo ni nota, y con destino en Cuba', () => {
    const texto = armarMensajePedido({
      idioma: 'en',
      numero: '20261113-KQTZ',
      lineas: lineas.slice(0, 1),
      subtotal: 1198,
      datos: { ...datos, correo: '', nota: '', entrega: 'cuba', direccion: 'La Habana, Plaza' },
    });
    expect(texto).toContain('*Order 20261113-KQTZ*');
    expect(texto).toContain('*Estimated subtotal: $1,198.00*');
    expect(texto).toContain('Delivery: Shipping to Cuba by Azeta Cargo — quoted separately');
    expect(texto).toContain('Destination in Cuba: La Habana, Plaza');
    expect(texto).not.toContain('Email:');
    expect(texto).not.toContain('Note:');
  });

  it('no incluye dirección cuando se recoge en Miami', () => {
    const texto = armarMensajePedido({
      idioma: 'es',
      numero: 'X',
      lineas,
      subtotal: 1,
      datos: { ...datos, entrega: 'recoger' },
    });
    expect(texto).toContain('Entrega: Recoger en Miami');
    expect(texto).not.toContain('Dirección:');
  });
});

describe('cotización de mayoreo', () => {
  const cotizacion: DatosCotizacion = {
    tipo: 'pallets',
    descripcion: 'Agua embotellada',
    cantidad: '4',
    unidad: 'pallets',
    destino: 'eeuu',
    ciudad: 'Orlando, FL',
    plazo: 'dos-semanas',
    nombre: 'Luis Gómez',
    empresa: 'Bodega Luis',
    telefono: '+1 407 555 0199',
    correo: '',
    nota: '',
  };

  it('valida los campos obligatorios', () => {
    expect(validarCotizacion(cotizacion, 'es')).toEqual({});
    expect(
      Object.keys(
        validarCotizacion(
          { ...cotizacion, tipo: '', descripcion: '', cantidad: '', destino: 'cuba', ciudad: '', plazo: '' },
          'es',
        ),
      ),
    ).toEqual(['tipo', 'descripcion', 'cantidad', 'ciudad', 'plazo']);
    expect(validarCotizacion({ ...cotizacion, destino: 'miami', ciudad: '' }, 'es')).toEqual({});
  });

  it('arma el mensaje', () => {
    expect(armarMensajeCotizacion({ idioma: 'es', numero: '20261113-ABCD', datos: cotizacion })).toBe(
      [
        'Hola, Azeta Cargo. Quiero pedir una cotización de mayoreo:',
        '',
        '*Cotización 20261113-ABCD*',
        'Qué quiero cotizar: Pallets',
        'Detalle: Agua embotellada',
        'Cantidad: 4 pallets',
        'Destino: Dentro de EE. UU.: Orlando, FL',
        'Para cuándo: En 2 semanas',
        '',
        '*Mis datos*',
        'Nombre: Luis Gómez',
        'Empresa: Bodega Luis',
        'Teléfono: +1 407 555 0199',
      ].join('\n'),
    );
  });
});

describe('enlaces de envío', () => {
  it('WhatsApp solo con un número válido y el texto codificado', () => {
    expect(numeroWhatsApp('')).toBeNull();
    expect(numeroWhatsApp('+1 (305) 555-0123')).toBe('13055550123');
    expect(urlWhatsApp('', 'hola')).toBeNull();
    expect(urlWhatsApp('13055550123', 'Pedido *1*\n2 × $5')).toBe(
      'https://wa.me/13055550123?text=Pedido%20*1*%0A2%20%C3%97%20%245',
    );
  });

  it('correo con asunto y cuerpo, sin asteriscos y con saltos de línea de correo', () => {
    expect(urlCorreo('', 'a', 'b')).toBeNull();
    expect(urlCorreo('pedidos@ejemplo.com', 'Pedido 1', '*Hola*\nTotal')).toBe(
      'mailto:pedidos@ejemplo.com?subject=Pedido%201&body=Hola%0D%0ATotal',
    );
  });
});
