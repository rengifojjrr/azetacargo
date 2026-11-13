/**
 * El recorrido principal: Tienda → Energía → Agregar → Carrito → Hacer pedido → se arma el mensaje.
 */
import { expect, test } from '@playwright/test';
import { cuentaCarrito, dinero, irACategoria } from './ayudas.ts';

test.beforeEach(async ({ context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
});

test('Tienda → Energía → Agregar → Carrito → Hacer pedido: se arma el mensaje', async ({ page }) => {
  await page.goto('');
  await page.getByRole('link', { name: 'Ver la tienda' }).click();
  await expect(page).toHaveURL(/\/tienda\/$/);

  await irACategoria(page, 'Energía');
  await expect(page).toHaveURL(/\/tienda\/energia\/$/);

  // Agregar dos productos distintos
  const estacion = page.getByRole('button', { name: 'Agregar Estación de energía portátil 1 000 Wh al carrito' });
  await estacion.click();
  await expect(estacion).toContainText('Agregado');
  await expect(page.locator('[data-aviso]')).toContainText('Agregado al carrito');
  await expect.poll(() => cuentaCarrito(page)).toBe('1');

  await page.getByRole('button', { name: /^Agregar Power bank 20 000 mAh/ }).click();
  await expect.poll(() => cuentaCarrito(page)).toBe('2');

  // Carrito: suma y cambia con la cantidad
  await page.getByRole('link', { name: /^Carrito, 2 productos/ }).click();
  await expect(page).toHaveURL(/\/carrito\/$/);
  const lineas = page.locator('[data-lineas] > li');
  await expect(lineas).toHaveCount(2);
  const subtotal = page.locator('[data-subtotal]');
  await expect(subtotal).toHaveText('$638.99'); // 599.00 + 39.99

  await page.getByRole('button', { name: /^Agregar una unidad: Estación de energía/ }).click();
  await expect(subtotal).toHaveText('$1,237.99');
  await expect(page.locator('[data-unidades]')).toHaveText('3 unidades');
  await expect.poll(() => cuentaCarrito(page)).toBe('3');
  const totales = await lineas.locator('.linea__total').allTextContents();
  expect(totales.map(dinero).reduce((a, b) => a + b, 0)).toBeCloseTo(1237.99, 2);
  await expect(page.getByText('No hay pago en línea en esta versión').first()).toBeVisible();

  // Pedido: primero los errores, luego los datos
  await page.getByRole('button', { name: 'Hacer pedido' }).click();
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  await expect(page.getByRole('alert')).toHaveText('Revisa los campos marcados.');
  await expect(page.getByText('Escribe tu nombre.')).toBeVisible();
  await expect(page.getByLabel('Nombre y apellido')).toBeFocused();

  await page.getByLabel('Nombre y apellido').fill('Ana Pérez');
  await page.getByLabel('Teléfono').fill('(305) 555-0101');
  await page.getByLabel(/Correo/).fill('ana@ejemplo.com');
  await page.getByText('Envío dentro de EE. UU.').click();
  await page.getByLabel('Dirección de entrega').fill('100 Calle Ocho, Miami, FL 33135');
  await page.getByLabel(/Nota/).fill('Llamar después de las 5');
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();

  // Se arma el mensaje
  const panel = page.locator('#confirmacion');
  await expect(panel.getByRole('heading', { level: 2 })).toHaveText(/^Pedido \d{8}-[A-HJ-NP-Z]{4} listo para enviar$/);
  const mensaje = panel.locator('[data-envio-texto]');
  await expect(mensaje).toContainText('Hola, Azeta Cargo. Quiero hacer este pedido:');
  await expect(mensaje).toContainText('Estación de energía portátil 1 000 Wh (AZ-ENE-001)');
  await expect(mensaje).toContainText('2 × $599.00 = $1,198.00');
  await expect(mensaje).toContainText('*Subtotal estimado: $1,237.99*');
  await expect(mensaje).toContainText('Entrega: Envío dentro de EE. UU.');
  await expect(mensaje).toContainText('Dirección: 100 Calle Ocho, Miami, FL 33135');

  // Versión de prueba: sin WhatsApp ni correo configurados, se puede copiar
  await expect(panel.getByRole('link', { name: 'Enviar por WhatsApp' })).toBeHidden();
  await expect(panel.getByText('Versión de prueba: todavía no hay un WhatsApp')).toBeVisible();
  await panel.getByRole('button', { name: 'Copiar pedido' }).click();
  await expect(panel.getByRole('status')).toHaveText('Pedido copiado');
  const copiado = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiado).toContain('*Subtotal estimado: $1,237.99*');

  // El carrito queda vacío y se puede volver a editar
  await expect.poll(() => cuentaCarrito(page)).toBe('0');
  await panel.getByRole('button', { name: 'Modificar pedido' }).click();
  await expect(lineas).toHaveCount(2);
  await expect(subtotal).toHaveText('$1,237.99');
});

test('desde la ficha se agrega la cantidad elegida', async ({ page }) => {
  await page.goto('producto/az-her-001/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Taladro inalámbrico 20 V con 2 baterías');
  await page.getByRole('button', { name: 'Agregar una unidad' }).click();
  await page.getByRole('button', { name: 'Agregar una unidad' }).click();
  await expect(page.getByLabel('Cantidad')).toHaveValue('3');
  await page.getByRole('button', { name: 'Agregar al carrito' }).click();
  await expect.poll(() => cuentaCarrito(page)).toBe('3');
  await page.goto('carrito/');
  await expect(page.locator('[data-subtotal]')).toHaveText('$297.00');
});

test('los productos agotados no se pueden agregar', async ({ page }) => {
  await page.goto('producto/az-ene-008/');
  await expect(page.getByText('Agotado', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Agregar al carrito' })).toHaveCount(0);
});

test('el carrito vacío invita a ir a la tienda', async ({ page }) => {
  await page.goto('carrito/');
  await expect(page.getByText('Tu carrito está vacío.')).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: 'Ver la tienda' })).toBeVisible();
});
