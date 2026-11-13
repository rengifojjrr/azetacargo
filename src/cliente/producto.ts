/** Ficha del producto: botones − / + de la cantidad y miniaturas de la galería. */
import { CANTIDAD_MAXIMA } from '../lib/carrito.ts';

const control = document.querySelector<HTMLElement>('[data-cantidad-control]');
const campo = control?.querySelector<HTMLInputElement>('input');

function fijar(valor: number): void {
  if (!campo) return;
  const n = Number.isFinite(valor) ? Math.min(CANTIDAD_MAXIMA, Math.max(1, Math.floor(valor))) : 1;
  campo.value = String(n);
}

control?.querySelector('[data-restar]')?.addEventListener('click', () => fijar(Number(campo?.value) - 1));
control?.querySelector('[data-sumar]')?.addEventListener('click', () => fijar(Number(campo?.value) + 1));
campo?.addEventListener('change', () => fijar(Number(campo.value)));

const galeria = document.querySelector<HTMLElement>('[data-galeria]');
galeria?.addEventListener('click', (e) => {
  const boton = e.target instanceof Element ? e.target.closest<HTMLButtonElement>('[data-ver-foto]') : null;
  if (!boton) return;
  const elegida = boton.dataset.verFoto;
  for (const foto of galeria.querySelectorAll<HTMLElement>('[data-foto]')) foto.hidden = foto.dataset.foto !== elegida;
  for (const otro of galeria.querySelectorAll<HTMLButtonElement>('[data-ver-foto]')) {
    otro.setAttribute('aria-pressed', String(otro === boton));
  }
});
