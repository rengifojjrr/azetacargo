/** Lee los colores de tokens.css para usarlos donde CSS no llega (SVG sueltos, theme-color, imágenes). */

export function leerTokens(css: string): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const [, nombre, valor] of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (nombre && valor && !tokens.has(nombre)) tokens.set(nombre, valor.trim());
  }
  return tokens;
}

/** Valor final de un token, siguiendo las referencias var(--otro). */
export function valorToken(tokens: Map<string, string>, nombre: string): string {
  let valor = tokens.get(nombre);
  const vistos = new Set<string>();
  while (valor !== undefined) {
    const referencia = /^var\((--[\w-]+)\)$/.exec(valor)?.[1];
    if (!referencia || vistos.has(referencia)) return valor;
    vistos.add(referencia);
    valor = tokens.get(referencia);
  }
  throw new Error(`No existe el token ${nombre} en tokens.css`);
}
