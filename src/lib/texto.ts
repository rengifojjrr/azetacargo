/** Funciones de texto que no dependen del navegador ni de Node. */

const ACENTOS = /[̀-ͯ]/g;

/** Minúsculas, sin acentos ni signos y con espacios simples. Sirve para comparar y buscar. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(ACENTOS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Raíz sencilla para que «taladros» encuentre «taladro» y «colchones» encuentre «colchón». */
export function raiz(palabra: string): string {
  if (palabra.length > 4 && palabra.endsWith('es')) return palabra.slice(0, -2);
  if (palabra.length > 3 && palabra.endsWith('s')) return palabra.slice(0, -1);
  return palabra;
}

/** Palabras de una búsqueda, normalizadas y reducidas a su raíz. */
export function palabrasDeBusqueda(consulta: string): string[] {
  return normalizar(consulta)
    .split(' ')
    .filter((p) => p.length > 0)
    .map(raiz);
}

/** Evita que «1 000 Wh» se parta en dos líneas: el espacio de miles pasa a ser no separable. */
export function unirMiles(texto: string): string {
  return texto.replace(/(\d)[   ](?=\d{3}(?!\d))/g, '$1 ');
}

/**
 * Pasa números escritos a la española al formato inglés: «1,5 kg» → «1.5 kg» y «1 000 Wh» → «1,000 Wh».
 * Solo toca números; las palabras se traducen con el glosario.
 */
export function numerosEnIngles(texto: string): string {
  const conPunto = texto.replace(/(\d),(\d)/g, '$1.$2');
  return conPunto.replace(/(\d)[   ](?=\d{3}(?!\d))/g, '$1,');
}

/** «Hola mundo» → «hola-mundo», para identificadores. */
export function aIdentificador(texto: string): string {
  return normalizar(texto).replace(/ /g, '-');
}

/** Recorta un texto a `maximo` caracteres sin cortar palabras y agrega «…». */
export function recortar(texto: string, maximo: number): string {
  const limpio = texto.replace(/\s+/g, ' ').trim();
  if (limpio.length <= maximo) return limpio;
  const corte = limpio.slice(0, maximo - 1);
  const ultimoEspacio = corte.lastIndexOf(' ');
  return `${(ultimoEspacio > maximo * 0.6 ? corte.slice(0, ultimoEspacio) : corte).replace(/[\s,.;:]+$/, '')}…`;
}
