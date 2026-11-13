/**
 * Traduce al inglés las características de los productos («Capacidad: 1 000 Wh» → «Capacity: 1,000 Wh»)
 * con el glosario de catalogo/glosario.csv (columnas «es» y «en»).
 * Primero busca el texto completo; si no está, traduce palabra por palabra y pasa los números al formato inglés.
 */
import { leerCsv } from './csv.ts';
import { numerosEnIngles } from './texto.ts';

function clave(texto: string): string {
  return texto.trim().toLowerCase().replace(/\s+/g, ' ');
}

function claveSinAcentos(texto: string): string {
  return clave(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export interface Traduccion {
  texto: string;
  /** Palabras que no estaban en el glosario (para avisar al compilar). */
  sinTraducir: string[];
}

export interface Traductor {
  traducir(texto: string): Traduccion;
}

export function crearTraductor(glosarioCsv: string): Traductor {
  const exactas = new Map<string, string>();
  const sinAcentos = new Map<string, string>();
  if (glosarioCsv.trim() !== '') {
    for (const fila of leerCsv(glosarioCsv).filas) {
      const es = fila.valores.es ?? '';
      const en = fila.valores.en ?? '';
      if (es !== '' && en !== '') {
        exactas.set(clave(es), en);
        sinAcentos.set(claveSinAcentos(es), en);
      }
    }
  }
  const buscar = (texto: string): string | undefined =>
    exactas.get(clave(texto)) ?? sinAcentos.get(claveSinAcentos(texto));

  return {
    traducir(texto: string): Traduccion {
      const completa = buscar(texto);
      if (completa !== undefined) return { texto: numerosEnIngles(completa), sinTraducir: [] };

      const sinTraducir: string[] = [];
      const partes = texto.split(/([\s,;/()+×]+)/);
      const traducidas = partes.map((parte) => {
        if (!/\p{L}/u.test(parte)) return parte;
        const t = buscar(parte);
        if (t !== undefined) return t;
        const letras = (parte.match(/\p{L}/gu) ?? []).length;
        const esSigla = parte === parte.toUpperCase();
        if (letras >= 4 && !esSigla && !sinTraducir.includes(parte)) sinTraducir.push(parte);
        return parte;
      });
      return { texto: numerosEnIngles(traducidas.join('')), sinTraducir };
    },
  };
}
