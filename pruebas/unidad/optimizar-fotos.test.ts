/** La optimización de fotos al compilar: achica la original, quita metadatos y crea copias WebP. */
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterAll, describe, expect, it } from 'vitest';
import { optimizarCarpeta } from '../../integraciones/optimizar-fotos.ts';

const carpetas: string[] = [];
afterAll(async () => {
  await Promise.all(carpetas.map((c) => rm(c, { recursive: true, force: true })));
});

describe('optimización de fotos', () => {
  it('crea las copias WebP, limita el ancho y quita los metadatos', async () => {
    const carpeta = await mkdtemp(path.join(tmpdir(), 'azeta-fotos-'));
    carpetas.push(carpeta);
    // Una «foto» de 2400 × 1800 con datos EXIF, como las de un teléfono.
    await sharp({ create: { width: 2400, height: 1800, channels: 3, background: { r: 200, g: 120, b: 40 } } })
      .withExif({ IFD0: { Make: 'Telefono', Model: 'Prueba' } })
      .jpeg()
      .toFile(path.join(carpeta, 'AZ-ENE-001-1.jpg'));
    await sharp({ create: { width: 300, height: 225, channels: 3, background: { r: 10, g: 20, b: 30 } } })
      .png()
      .toFile(path.join(carpeta, 'AZ-ENE-001-2.png'));

    expect(await optimizarCarpeta(carpeta)).toBe(2);

    expect((await readdir(carpeta)).sort()).toEqual([
      'AZ-ENE-001-1-480.webp',
      'AZ-ENE-001-1-960.webp',
      'AZ-ENE-001-1.jpg',
      'AZ-ENE-001-2-480.webp',
      'AZ-ENE-001-2-960.webp',
      'AZ-ENE-001-2.png',
    ]);
    const original = await sharp(path.join(carpeta, 'AZ-ENE-001-1.jpg')).metadata();
    expect(original.width).toBe(1600);
    expect(original.exif).toBeUndefined();
    expect((await sharp(path.join(carpeta, 'AZ-ENE-001-1-480.webp')).metadata()).width).toBe(480);
    expect((await sharp(path.join(carpeta, 'AZ-ENE-001-1-960.webp')).metadata()).width).toBe(960);
    // Las fotos chicas no se agrandan.
    expect((await sharp(path.join(carpeta, 'AZ-ENE-001-2-960.webp')).metadata()).width).toBe(300);
  });

  it('no falla si la carpeta no existe', async () => {
    expect(await optimizarCarpeta(path.join(tmpdir(), 'azeta-no-existe-123'))).toBe(0);
  });
});
