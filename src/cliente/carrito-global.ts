/**
 * En todas las páginas: el contador del carrito en la cabecera y los botones «Agregar».
 * Un botón con data-agregar="SKU" suma una unidad; si tiene data-cantidad="#id", suma lo que diga ese campo.
 */
import type { Idioma } from '../lib/catalogo.ts';
import { agregar, totalUnidades, type Carrito } from '../lib/carrito.ts';
import { iconoSvg } from '../lib/iconos.ts';
import { textos } from '../i18n/textos.ts';
import { alCambiarCarrito, cargarCarrito, guardarElCarrito } from './almacen.ts';

const idioma: Idioma = document.documentElement.lang === 'en' ? 'en' : 'es';
const t = textos(idioma);

function pintarContador(carrito: Carrito): void {
  const unidades = totalUnidades(carrito);
  for (const enlace of document.querySelectorAll<HTMLAnchorElement>('[data-enlace-carrito]')) {
    enlace.setAttribute('aria-label', t.cabecera.carritoUnidades(unidades));
  }
  for (const cuenta of document.querySelectorAll<HTMLElement>('[data-cuenta-carrito]')) {
    cuenta.textContent = String(unidades);
    cuenta.hidden = unidades === 0;
  }
}

let temporizador: number | undefined;

function avisar(mensaje: string): void {
  const aviso = document.querySelector<HTMLElement>('[data-aviso]');
  const texto = document.querySelector<HTMLElement>('[data-aviso-texto]');
  const anuncio = document.querySelector<HTMLElement>('[data-anuncio]');
  if (anuncio) {
    anuncio.textContent = '';
    window.setTimeout(() => (anuncio.textContent = mensaje), 50);
  }
  if (!aviso || !texto) return;
  texto.textContent = mensaje;
  aviso.hidden = false;
  window.clearTimeout(temporizador);
  temporizador = window.setTimeout(() => (aviso.hidden = true), 5000);
}

function cantidadPedida(boton: HTMLElement): number {
  const selector = boton.dataset.cantidad;
  if (!selector) return 1;
  const campo = document.querySelector<HTMLInputElement>(selector);
  const n = Number(campo?.value ?? 1);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

const textosOriginales = new WeakMap<HTMLElement, string>();

function confirmarEnBoton(boton: HTMLElement): void {
  if (!textosOriginales.has(boton)) textosOriginales.set(boton, boton.innerHTML);
  boton.innerHTML = `${iconoSvg('check', 18)}<span>${t.tarjeta.agregado}</span>`;
  window.setTimeout(() => {
    const original = textosOriginales.get(boton);
    if (original !== undefined) boton.innerHTML = original;
  }, 1600);
}

document.addEventListener('click', (evento) => {
  const objetivo = evento.target instanceof Element ? evento.target.closest<HTMLElement>('[data-agregar]') : null;
  if (!objetivo || objetivo.hasAttribute('disabled')) return;
  const sku = objetivo.dataset.agregar;
  if (!sku) return;
  guardarElCarrito(agregar(cargarCarrito(), sku, cantidadPedida(objetivo)));
  confirmarEnBoton(objetivo);
  avisar(t.aviso.agregado(objetivo.dataset.nombre ?? sku));
});

alCambiarCarrito(pintarContador);
pintarContador(cargarCarrito());
