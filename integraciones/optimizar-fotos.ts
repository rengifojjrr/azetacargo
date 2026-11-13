/**
 * Optimiza las fotos de productos al compilar: endereza según EXIF, quita metadatos (incluida la ubicación),
 * limita el ancho de la original y crea copias WebP de 480 y 960 px.
 * Trabaja sobre dist/productos/, así que las fotos de public/productos/ no se tocan.
 */
import { readdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import sharp from 'sharp';
import { ANCHO_MAXIMO_ORIGINAL, CARPETA_FOTOS, esFoto, variantesWebp } from '../src/lib/fotos.ts';

export async function optimizarCarpeta(carpeta: string): Promise<number> {
  let archivos: string[];
  try {
    archivos = await readdir(carpeta);
  } catch {
    return 0;
  }
  let procesadas = 0;
  for (const archivo of archivos.filter(esFoto)) {
    const origen = path.join(carpeta, archivo);
    for (const variante of variantesWebp(archivo)) {
      await sharp(origen)
        .rotate()
        .resize({ width: variante.ancho, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(path.join(carpeta, variante.archivo));
    }
    const extension = path.extname(archivo).toLowerCase();
    let original = sharp(origen).rotate().resize({ width: ANCHO_MAXIMO_ORIGINAL, withoutEnlargement: true });
    if (extension === '.png') original = original.png({ compressionLevel: 9 });
    else if (extension === '.webp') original = original.webp({ quality: 82 });
    else original = original.jpeg({ quality: 82, mozjpeg: true });
    const temporal = `${origen}.tmp`;
    await original.toFile(temporal);
    await rename(temporal, origen);
    procesadas++;
  }
  return procesadas;
}

export function optimizarFotos(): AstroIntegration {
  return {
    name: 'azeta:optimizar-fotos',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const carpeta = fileURLToPath(new URL(`${CARPETA_FOTOS}/`, dir));
        const procesadas = await optimizarCarpeta(carpeta);
        logger.info(procesadas === 0 ? 'Sin fotos de productos todavía.' : `${procesadas} fotos optimizadas.`);
      },
    },
  };
}
