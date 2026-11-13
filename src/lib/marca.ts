/**
 * El colibrí de la marca (logo provisional): facetas de trazos rectos en dos papeles,
 * «primario» (azul marino; blanco sobre fondo oscuro) y «acento» (turquesa).
 * Lo usan el logotipo, el ícono de la pestaña y la imagen para compartir.
 */

export interface Faceta {
  papel: 'primario' | 'acento';
  puntos: string;
}

export const VISTA_COLIBRI = '0 0 48 40';

export const FACETAS_COLIBRI: Faceta[] = [
  // Ala lejana, alzada hacia atrás
  { papel: 'acento', puntos: '25.4,11.9 11.6,0.8 15.4,7.4 21.4,13.0' },
  // Ala cercana
  { papel: 'primario', puntos: '23.0,15.0 2.4,7.2 9.6,12.6 19.8,18.4' },
  // Cabeza
  { papel: 'acento', puntos: '28.8,8.6 35.2,6.8 38.2,10.2 33.4,13.4' },
  // Pico largo y fino
  { papel: 'primario', puntos: '38.5,9.75 47.6,7.6 38.7,11.0' },
  // Lomo
  { papel: 'primario', puntos: '28.1,9.4 32.8,14.0 22.3,24.6 19.4,25.6 21.4,18.6' },
  // Pecho
  { papel: 'acento', puntos: '33.5,14.4 30.6,20.2 21.6,26.6 23.2,23.8' },
  // Cola en dos plumas
  { papel: 'primario', puntos: '19.7,26.6 11.8,38.6 15.8,28.6' },
  { papel: 'acento', puntos: '21.3,27.2 18.2,39.2 17.9,29.6' },
];

/** Ojo: un cuadrito sobre la cabeza. */
export const OJO_COLIBRI = { x: 33.4, y: 8.9, lado: 1.3 };

/** El colibrí como SVG con colores fijos (para archivos: ícono de pestaña, imagen para compartir). */
export function svgColibri(colores: { primario: string; acento: string; ojo: string }, extra = ''): string {
  const facetas = FACETAS_COLIBRI.map((f) => `<polygon points="${f.puntos}" fill="${colores[f.papel]}"/>`).join('');
  const ojo = `<rect x="${OJO_COLIBRI.x}" y="${OJO_COLIBRI.y}" width="${OJO_COLIBRI.lado}" height="${OJO_COLIBRI.lado}" fill="${colores.ojo}"/>`;
  return `${extra}${facetas}${ojo}`;
}
