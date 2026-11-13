import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { esTelefono } from './ayudas.ts';

test('la portada tiene el título, las categorías, los destacados y la franja de mayoreo', async ({ page }) => {
  await page.goto('');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Electrónica, hogar, energía y herramientas. Desde Miami.');
  await expect(page.locator('.categoria')).toHaveCount(8);
  await expect(page.getByRole('heading', { name: 'Destacados' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mayoreo y carga' })).toBeVisible();
  await expect(page.getByText('Versión de prueba', { exact: true })).toBeVisible();
  await expect(page.getByText('Precios y productos de ejemplo')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  const marketplace = page.getByRole('link', { name: /Azeta Marketplace — próximamente/ });
  await expect(marketplace).toHaveAttribute('href', 'https://azeta.app');
});

test('el menú del teléfono abre las categorías', async ({ page }) => {
  test.skip(!esTelefono(page), 'Solo en pantallas chicas');
  await page.goto('');
  // <summary> no tiene rol de botón en el árbol de accesibilidad de Chromium; se busca por su etiqueta.
  await page.getByLabel('Menú', { exact: true }).click();
  await page.getByRole('navigation', { name: 'Secciones de la tienda' }).getByRole('link', { name: 'Bicicletas' }).click();
  await expect(page).toHaveURL(/\/tienda\/bicicletas\/$/);
});

test('cambia de idioma conservando la página', async ({ page }) => {
  await page.goto('producto/az-ene-001/');
  await page.getByRole('link', { name: /^EN/ }).click();
  await expect(page).toHaveURL(/\/en\/product\/az-ene-001\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Portable power station 1,000 Wh');
  await expect(page.getByRole('rowheader', { name: 'Capacity' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '1,000 Wh' })).toBeVisible();
  await expect(page.locator('link[hreflang="es"]')).toHaveAttribute('href', /\/producto\/az-ene-001\/$/);
  await page.getByRole('link', { name: /^ES/ }).click();
  await expect(page).toHaveURL(/\/producto\/az-ene-001\/$/);
});

test('el pedido en inglés sale en inglés', async ({ page }) => {
  await page.goto('en/product/az-aut-001/');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.goto('en/cart/');
  await page.getByRole('button', { name: 'Place order' }).click();
  await page.getByLabel('Full name').fill('John Smith');
  await page.getByLabel('Phone').fill('+1 305 555 0199');
  await page.getByText('Pick up in Miami').click();
  await page.getByRole('button', { name: 'Confirm order' }).click();
  const mensaje = page.locator('[data-envio-texto]');
  await expect(mensaje).toContainText('Hello, Azeta Cargo. I would like to place this order:');
  await expect(mensaje).toContainText('Delivery: Pick up in Miami');
  await expect(mensaje).not.toContainText('Address:');
});

test('la cotización de mayoreo valida y arma la solicitud', async ({ page }) => {
  await page.goto('mayoreo/?sku=AZ-ENE-001');
  await expect(page.getByLabel('Qué necesitas')).toHaveValue(/^Estación de energía portátil 1\s000 Wh \(AZ-ENE-001\)$/);
  await page.getByRole('button', { name: 'Armar solicitud' }).click();
  await expect(page.getByText('Escribe la cantidad.')).toBeVisible();

  await page.getByLabel('Cantidad').fill('20');
  await page.getByLabel('Unidad').selectOption('unidades');
  await page.getByLabel('A dónde').selectOption('cuba');
  await expect(page.getByLabel('Provincia y municipio')).toBeVisible();
  await page.getByLabel('Provincia y municipio').fill('La Habana, Plaza');
  await page.getByLabel('Para cuándo').selectOption('mes');
  await page.getByLabel('Nombre y apellido').fill('Luis Gómez');
  await page.getByLabel('Teléfono').fill('+1 786 555 0100');
  await page.getByRole('button', { name: 'Armar solicitud' }).click();

  const panel = page.locator('#solicitud');
  await expect(panel.getByRole('heading', { level: 2 })).toHaveText(/^Solicitud \d{8}-[A-Z]{4} lista para enviar$/);
  await expect(panel.locator('[data-envio-texto]')).toContainText('Destino: Cuba — se cotiza aparte: La Habana, Plaza');
  await expect(panel.locator('[data-envio-texto]')).toContainText('Cantidad: 20 unidades');
});

test('las páginas de información cargan en los dos idiomas', async ({ page }) => {
  const paginas = [
    ['envios/', 'Envíos y entregas'],
    ['nosotros/', 'Nosotros'],
    ['contacto/', 'Contacto'],
    ['preguntas-frecuentes/', 'Preguntas frecuentes'],
    ['terminos/', 'Términos y condiciones'],
    ['privacidad/', 'Aviso de privacidad'],
    ['en/shipping/', 'Shipping and delivery'],
    ['en/about/', 'About us'],
    ['en/contact/', 'Contact'],
    ['en/faq/', 'Frequently asked questions'],
    ['en/terms/', 'Terms and conditions'],
    ['en/privacy/', 'Privacy notice'],
    ['en/wholesale/', 'Wholesale & cargo'],
  ] as const;
  for (const [ruta, titulo] of paginas) {
    await page.goto(ruta);
    await expect(page.getByRole('heading', { level: 1 }), ruta).toHaveText(titulo);
  }
  await page.goto('terminos/');
  await expect(page.getByText('Borrador — revisar con abogado')).toBeVisible();
  await page.goto('en/privacy/');
  await expect(page.getByText('Draft — to be reviewed by a lawyer')).toBeVisible();
});

test('una dirección que no existe muestra la página 404 con enlace a la tienda', async ({ page }) => {
  const respuesta = await page.goto('no-existe/');
  expect(respuesta?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Esta página no existe');
  await page.getByRole('link', { name: 'Ir a la tienda' }).click();
  await expect(page).toHaveURL(/\/tienda\/$/);
});

test('ninguna página habla de pagar en Cuba ni de licencias', async ({ page }) => {
  for (const ruta of ['', 'envios/', 'preguntas-frecuentes/', 'mayoreo/', 'carrito/', 'terminos/', 'en/', 'en/faq/']) {
    await page.goto(ruta);
    const texto = (await page.locator('body').innerText()).toLowerCase();
    expect(texto, ruta).not.toMatch(/\blicencias?\b|\blicenses?\b|\bpermisos?\b|\bpermits?\b|pagar en cuba|pay in cuba|entrega garantizada en cuba/);
  }
});

for (const ruta of ['', 'tienda/', 'tienda/energia/', 'producto/az-ene-001/', 'carrito/', 'mayoreo/', 'en/', 'preguntas-frecuentes/']) {
  test(`accesibilidad sin fallas (axe): /${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    const resultado = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}
