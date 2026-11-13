import { expect, test } from '@playwright/test';
import { dinero, esTelefono } from './ayudas.ts';

async function abrirFiltros(page: import('@playwright/test').Page) {
  if (esTelefono(page)) await page.getByRole('button', { name: /filtrar y ordenar/i }).click();
}

test('filtra por marca, precio y disponibilidad, y guarda los filtros en la dirección', async ({ page }) => {
  await page.goto('tienda/');
  const tarjetas = page.locator('[data-lista-productos] > li:not([hidden])');
  await expect(page.locator('[data-cuenta-resultados]')).toHaveText('42 productos');

  await abrirFiltros(page);
  await page.getByRole('checkbox', { name: /Marca D/ }).check();
  await expect(page).toHaveURL(/marca=Marca\+D/);
  const conMarca = await tarjetas.count();
  expect(conMarca).toBeGreaterThan(0);
  for (const marca of await tarjetas.locator('[data-producto]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.marca))) {
    expect(marca).toBe('Marca D');
  }

  await page.getByLabel('Hasta').fill('150');
  await expect(page).toHaveURL(/max=150/);
  for (const precio of await tarjetas.locator('[data-producto]').evaluateAll((els) => els.map((e) => Number((e as HTMLElement).dataset.precio)))) {
    expect(precio).toBeLessThanOrEqual(150);
  }

  await page.getByRole('checkbox', { name: 'Solo disponibles' }).check();
  await expect(tarjetas.getByRole('button', { name: 'Agotado' })).toHaveCount(0);

  // Al recargar, los filtros siguen puestos
  await page.reload();
  await abrirFiltros(page);
  await expect(page.getByRole('checkbox', { name: /Marca D/ })).toBeChecked();
  await expect(page.getByLabel('Hasta')).toHaveValue('150');

  await page.getByRole('button', { name: 'Quitar filtros' }).first().click();
  await expect(page.locator('[data-cuenta-resultados]')).toHaveText('42 productos');
});

test('ordena por precio', async ({ page }) => {
  await page.goto('tienda/herramientas/');
  await page.getByLabel('Ordenar por').selectOption('precio-asc');
  const disponibles = page.locator('[data-lista-productos] > li:not([hidden]) [data-producto][data-disponible="1"]');
  const precios = await disponibles.evaluateAll((els) => els.map((e) => Number((e as HTMLElement).dataset.precio)));
  expect(precios).toEqual([...precios].sort((a, b) => a - b));
  await page.getByLabel('Ordenar por').selectOption('precio-desc');
  const alReves = await disponibles.evaluateAll((els) => els.map((e) => Number((e as HTMLElement).dataset.precio)));
  expect(alReves).toEqual([...alReves].sort((a, b) => b - a));
});

test('busca con el índice JSON, sin acentos y en plural', async ({ page }) => {
  await page.goto('');
  await page.getByRole('searchbox', { name: 'Buscar en la tienda' }).fill('taladros inalambricos');
  await page.getByRole('searchbox', { name: 'Buscar en la tienda' }).press('Enter');
  await expect(page).toHaveURL(/\/tienda\/\?q=taladros/);
  await expect(page.getByText('Resultados para «taladros inalambricos»')).toBeVisible();
  const nombres = await page.locator('[data-lista-productos] > li:not([hidden]) .tarjeta__nombre').allTextContents();
  expect(nombres.length).toBeGreaterThanOrEqual(2);
  for (const nombre of nombres) expect(nombre).toMatch(/Taladro/);

  await page.getByRole('link', { name: 'Quitar búsqueda' }).click();
  await expect(page.locator('[data-cuenta-resultados]')).toHaveText('42 productos');
});

test('una búsqueda sin resultados lo dice claro', async ({ page }) => {
  await page.goto('tienda/?q=zzzzz');
  await expect(page.getByText('No encontramos productos para «zzzzz».')).toBeVisible();
});

test('las tarjetas muestran precio de oferta, SKU y precios en USD', async ({ page }) => {
  await page.goto('tienda/energia/');
  const tarjeta = page.locator('[data-producto][data-sku="AZ-ENE-001"]');
  await expect(tarjeta.locator('.sku')).toHaveText('AZ-ENE-001');
  await expect(tarjeta.locator('.precio__actual')).toContainText('$599.00');
  expect(dinero(await tarjeta.locator('.precio__antes').textContent())).toBe(699);
  await expect(tarjeta.getByText('Oferta', { exact: true })).toBeVisible();
});
