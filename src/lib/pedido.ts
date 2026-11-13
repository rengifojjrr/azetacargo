/**
 * Pedido y solicitud de cotización: validación, número y armado del mensaje que se manda por WhatsApp o correo.
 * Todo es puro (sin navegador) para poder probarlo.
 */
import type { Idioma } from './catalogo.ts';
import { formatearPrecio } from './formato.ts';
import { textos } from '../i18n/textos.ts';

export const FORMAS_ENTREGA = ['recoger', 'eeuu', 'cuba'] as const;
export type FormaEntrega = (typeof FORMAS_ENTREGA)[number];

export interface DatosPedido {
  nombre: string;
  telefono: string;
  correo: string;
  entrega: FormaEntrega | '';
  direccion: string;
  nota: string;
}

export type Errores<C extends string> = Partial<Record<C, string>>;

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function telefonoValido(telefono: string): boolean {
  const limpio = telefono.trim();
  const digitos = limpio.replace(/\D/g, '').length;
  return /^[0-9+()\-.\s]+$/.test(limpio) && digitos >= 7 && digitos <= 15;
}

export function necesitaDireccion(entrega: FormaEntrega | ''): boolean {
  return entrega === 'eeuu' || entrega === 'cuba';
}

export function validarPedido(datos: DatosPedido, idioma: Idioma): Errores<keyof DatosPedido> {
  const t = textos(idioma).formulario.errores;
  const errores: Errores<keyof DatosPedido> = {};
  if (datos.nombre.trim().length < 2) errores.nombre = t.nombre;
  if (!telefonoValido(datos.telefono)) errores.telefono = t.telefono;
  if (datos.correo.trim() !== '' && !CORREO.test(datos.correo.trim())) errores.correo = t.correo;
  if (!(FORMAS_ENTREGA as readonly string[]).includes(datos.entrega)) errores.entrega = t.entrega;
  if (necesitaDireccion(datos.entrega) && datos.direccion.trim().length < 4) {
    errores.direccion = datos.entrega === 'cuba' ? t.destinoCuba : t.direccion;
  }
  return errores;
}

// Sin I ni O para que no se confundan con 1 y 0 al dictar el número.
const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function azarSeguro(): number {
  const c = globalThis.crypto;
  if (c?.getRandomValues) {
    const valor = new Uint32Array(1);
    c.getRandomValues(valor);
    return (valor[0] ?? 0) / 2 ** 32;
  }
  return Math.random();
}

/** «20261113-KQTZ»: la fecha en Miami + 4 letras al azar. */
export function numeroDePedido(fecha: Date = new Date(), azar: () => number = azarSeguro): string {
  const dia = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(fecha)
    .replace(/-/g, '');
  let letras = '';
  for (let i = 0; i < 4; i++) letras += LETRAS[Math.floor(azar() * LETRAS.length) % LETRAS.length];
  return `${dia}-${letras}`;
}

export interface LineaMensaje {
  cantidad: number;
  nombre: string;
  sku: string;
  precioUnitario: number;
  total: number;
}

const limpiar = (texto: string) => texto.trim().replace(/\r\n?/g, '\n');

export function armarMensajePedido(p: {
  idioma: Idioma;
  numero: string;
  lineas: LineaMensaje[];
  subtotal: number;
  datos: DatosPedido;
}): string {
  const tt = textos(p.idioma);
  const t = tt.mensaje;
  const partes: string[] = [t.saludoPedido, '', `*${t.pedido} ${p.numero}*`];
  for (const l of p.lineas) {
    partes.push(`• ${l.nombre} (${l.sku})`);
    partes.push(`  ${l.cantidad} × ${formatearPrecio(l.precioUnitario)} = ${formatearPrecio(l.total)}`);
  }
  partes.push('', `*${t.subtotal}: ${formatearPrecio(p.subtotal)}*`, t.notaPrecios, '', `*${t.misDatos}*`);
  partes.push(`${t.nombre}: ${limpiar(p.datos.nombre)}`);
  partes.push(`${t.telefono}: ${limpiar(p.datos.telefono)}`);
  if (p.datos.correo.trim()) partes.push(`${t.correo}: ${limpiar(p.datos.correo)}`);
  if (p.datos.entrega) partes.push(`${t.entrega}: ${tt.entrega[p.datos.entrega]}`);
  if (necesitaDireccion(p.datos.entrega) && p.datos.direccion.trim()) {
    partes.push(`${p.datos.entrega === 'cuba' ? t.destinoCuba : t.direccion}: ${limpiar(p.datos.direccion)}`);
  }
  if (p.datos.nota.trim()) partes.push(`${t.nota}: ${limpiar(p.datos.nota)}`);
  return partes.join('\n');
}

// ── Cotización de mayoreo ───────────────────────────────────────────────────────────────────────────

export const TIPOS_COTIZACION = ['productos', 'cajas', 'pallets', 'contenedor', 'equipo'] as const;
export const UNIDADES_COTIZACION = ['unidades', 'cajas', 'pallets', 'contenedor-20', 'contenedor-40'] as const;
export const DESTINOS_COTIZACION = ['miami', 'eeuu', 'cuba', 'otro'] as const;
export const PLAZOS_COTIZACION = ['pronto', 'semana', 'dos-semanas', 'mes', 'sin-fecha'] as const;

export interface DatosCotizacion {
  tipo: (typeof TIPOS_COTIZACION)[number] | '';
  descripcion: string;
  cantidad: string;
  unidad: (typeof UNIDADES_COTIZACION)[number];
  destino: (typeof DESTINOS_COTIZACION)[number] | '';
  ciudad: string;
  plazo: (typeof PLAZOS_COTIZACION)[number] | '';
  nombre: string;
  empresa: string;
  telefono: string;
  correo: string;
  nota: string;
}

export function validarCotizacion(datos: DatosCotizacion, idioma: Idioma): Errores<keyof DatosCotizacion> {
  const t = textos(idioma).formulario.errores;
  const errores: Errores<keyof DatosCotizacion> = {};
  if (!(TIPOS_COTIZACION as readonly string[]).includes(datos.tipo)) errores.tipo = t.tipo;
  if (datos.descripcion.trim().length < 3) errores.descripcion = t.descripcion;
  if (datos.cantidad.trim() === '') errores.cantidad = t.cantidad;
  if (!(DESTINOS_COTIZACION as readonly string[]).includes(datos.destino)) errores.destino = t.destino;
  if (datos.destino !== '' && datos.destino !== 'miami' && datos.ciudad.trim().length < 2) {
    errores.ciudad = datos.destino === 'cuba' ? t.destinoCuba : t.ciudad;
  }
  if (!(PLAZOS_COTIZACION as readonly string[]).includes(datos.plazo)) errores.plazo = t.plazo;
  if (datos.nombre.trim().length < 2) errores.nombre = t.nombre;
  if (!telefonoValido(datos.telefono)) errores.telefono = t.telefono;
  if (datos.correo.trim() !== '' && !CORREO.test(datos.correo.trim())) errores.correo = t.correo;
  return errores;
}

export function armarMensajeCotizacion(p: { idioma: Idioma; numero: string; datos: DatosCotizacion }): string {
  const tt = textos(p.idioma);
  const t = tt.mensaje;
  const d = p.datos;
  const destino = d.destino ? tt.mayoreo.destinos[d.destino] : '';
  const lugar = d.destino !== 'miami' && d.ciudad.trim() ? `: ${limpiar(d.ciudad)}` : '';
  const partes = [
    t.saludoCotizacion,
    '',
    `*${t.cotizacion} ${p.numero}*`,
    `${t.tipo}: ${d.tipo ? tt.mayoreo.tipos[d.tipo] : ''}`,
    `${t.detalle}: ${limpiar(d.descripcion)}`,
    `${t.cantidad}: ${limpiar(d.cantidad)} ${tt.mayoreo.unidades[d.unidad].toLowerCase()}`,
    `${t.destino}: ${destino}${lugar}`,
    `${t.plazo}: ${d.plazo ? tt.mayoreo.plazos[d.plazo] : ''}`,
    '',
    `*${t.misDatos}*`,
    `${t.nombre}: ${limpiar(d.nombre)}`,
  ];
  if (d.empresa.trim()) partes.push(`${t.empresa}: ${limpiar(d.empresa)}`);
  partes.push(`${t.telefono}: ${limpiar(d.telefono)}`);
  if (d.correo.trim()) partes.push(`${t.correo}: ${limpiar(d.correo)}`);
  if (d.nota.trim()) partes.push(`${t.nota}: ${limpiar(d.nota)}`);
  return partes.join('\n');
}

// ── Enlaces para enviar ─────────────────────────────────────────────────────────────────────────────

/** Solo dígitos con código de país (p. ej. 13055550123). Vacío o inválido → null. */
export function numeroWhatsApp(numero: string): string | null {
  const digitos = numero.replace(/\D/g, '');
  return digitos.length >= 8 && digitos.length <= 15 ? digitos : null;
}

export function urlWhatsApp(numero: string, texto: string): string | null {
  const digitos = numeroWhatsApp(numero);
  return digitos ? `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}` : null;
}

export function urlCorreo(correo: string, asunto: string, cuerpo: string): string | null {
  const destino = correo.trim();
  if (!CORREO.test(destino)) return null;
  const cuerpoCorreo = cuerpo.replace(/\*/g, '').replace(/\n/g, '\r\n');
  return `mailto:${destino}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpoCorreo)}`;
}
