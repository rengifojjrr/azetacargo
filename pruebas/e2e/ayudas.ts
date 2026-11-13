import { expect, type Page } from '@playwright/test';

/** Convierte «$1,299.00» en 1299. */
export function dinero(texto: string | null): number {
  return Number((texto ?? '').replace(/[^\d.]/g, ''));
}

export function esTelefono(page: Page): boolean {
  return (page.viewportSize()?.width ?? 1280) < 1024;
}

/** Va a una categoría como lo haría una persona: desde la tienda (en el teléfono, abriendo los filtros). */
export async function irACategoria(page: Page, nombre: string): Promise<void> {
  await page.goto('tienda/');
  if (esTelefono(page)) await page.getByRole('button', { name: /filtrar y ordenar/i }).click();
  await page.locator('[data-panel-filtros]').getByRole('link', { name: new RegExp(`^${nombre}`) }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(new RegExp(nombre, 'i'));
}

export async function cuentaCarrito(page: Page): Promise<string> {
  const cuenta = page.locator('[data-cuenta-carrito]');
  return (await cuenta.isHidden()) ? '0' : ((await cuenta.textContent()) ?? '0');
}
