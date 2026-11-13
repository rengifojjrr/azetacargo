/** Ícono de la pestaña: el colibrí sobre un cuadrado azul marino (colores de tokens.css). */
import sharp from 'sharp';
import { svgColibri, VISTA_COLIBRI } from './marca.ts';
import { colores } from './sitio.ts';

export function svgFavicon(): string {
  const colibri = svgColibri({ primario: colores.blanco, acento: colores.turquesa, ojo: colores.marino });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" fill="${colores.marino}"/><svg x="6" y="9" width="52" height="44" viewBox="${VISTA_COLIBRI}">${colibri}</svg></svg>`;
}

export async function pngFavicon(lado: number): Promise<Uint8Array<ArrayBuffer>> {
  const datos = await sharp(Buffer.from(svgFavicon()), { density: 72 * (lado / 64) * 2 })
    .resize(lado, lado)
    .png()
    .toBuffer();
  return new Uint8Array(datos);
}
