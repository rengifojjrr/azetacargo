/**
 * El carrito y el último pedido en localStorage. Todo va en try/catch: en navegación privada o con el
 * almacenamiento bloqueado el carrito sigue funcionando en memoria mientras la página esté abierta.
 */
import { CARRITO_VACIO, guardarCarrito, leerCarrito, type Carrito, type LineaCarrito } from '../lib/carrito.ts';

const CLAVE_CARRITO = 'azeta-carrito';
const CLAVE_PEDIDO = 'azeta-ultimo-pedido';
const EVENTO = 'azeta:carrito';

let enMemoria: Carrito = CARRITO_VACIO;
let pedidoEnMemoria: UltimoPedido | null = null;

function leer(clave: string): string | null {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: string | null): void {
  try {
    if (valor === null) window.localStorage.removeItem(clave);
    else window.localStorage.setItem(clave, valor);
  } catch {
    // Sin almacenamiento: queda en memoria.
  }
}

export function cargarCarrito(): Carrito {
  const guardado = leer(CLAVE_CARRITO);
  return guardado === null ? enMemoria : leerCarrito(guardado);
}

export function guardarElCarrito(carrito: Carrito): void {
  enMemoria = carrito;
  escribir(CLAVE_CARRITO, guardarCarrito(carrito));
  document.dispatchEvent(new CustomEvent(EVENTO));
}

/** Avisa cuando cambia el carrito, también si cambió en otra pestaña. */
export function alCambiarCarrito(funcion: (carrito: Carrito) => void): void {
  document.addEventListener(EVENTO, () => funcion(cargarCarrito()));
  window.addEventListener('storage', (e) => {
    if (e.key === CLAVE_CARRITO) funcion(cargarCarrito());
  });
}

export interface UltimoPedido {
  numero: string;
  texto: string;
  lineas: LineaCarrito[];
  fecha: string;
}

export function guardarUltimoPedido(pedido: UltimoPedido): void {
  pedidoEnMemoria = pedido;
  escribir(CLAVE_PEDIDO, JSON.stringify(pedido));
}

export function leerUltimoPedido(): UltimoPedido | null {
  const texto = leer(CLAVE_PEDIDO);
  if (texto === null) return pedidoEnMemoria;
  try {
    const datos = JSON.parse(texto) as Partial<UltimoPedido>;
    if (typeof datos.numero === 'string' && typeof datos.texto === 'string' && Array.isArray(datos.lineas)) {
      return {
        numero: datos.numero,
        texto: datos.texto,
        lineas: datos.lineas,
        fecha: typeof datos.fecha === 'string' ? datos.fecha : '',
      };
    }
  } catch {
    // Dañado: se ignora.
  }
  return null;
}
