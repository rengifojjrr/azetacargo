/**
 * Revisa los CSV del catálogo antes de compilar: `npm run validar`.
 * Si hay errores, los muestra todos (archivo, fila, SKU y campo) y termina con error para que no se publique nada.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { construirCatalogo, describirProblema } from '../src/lib/catalogo.ts';
import { esFoto } from '../src/lib/fotos.ts';

const raiz = process.cwd();
const leer = (archivo: string) => readFileSync(path.join(raiz, archivo), 'utf8');

function listarFotos(): string[] {
  try {
    return readdirSync(path.join(raiz, 'public', 'productos')).filter(esFoto);
  } catch {
    return [];
  }
}
const fotos = listarFotos();

const resultado = construirCatalogo({
  productosCsv: leer('catalogo/productos.csv'),
  categoriasCsv: leer('catalogo/categorias.csv'),
  glosarioCsv: leer('catalogo/glosario.csv'),
  fotosDisponibles: fotos,
});

for (const aviso of resultado.avisos) console.warn(`  ! ${describirProblema(aviso)}`);

if (!resultado.ok) {
  console.error(
    `\n✗ El catálogo tiene ${resultado.errores.length} ${resultado.errores.length === 1 ? 'error' : 'errores'}. No se publica nada hasta corregirlo:\n`,
  );
  for (const error of resultado.errores) console.error(`  ✗ ${describirProblema(error)}`);
  console.error('');
  process.exit(1);
}

const { productos, categorias } = resultado.catalogo;
const ejemplos = productos.filter((p) => p.ejemplo).length;
console.info(
  `✓ Catálogo correcto: ${productos.length} productos en ${categorias.length} categorías` +
    `${ejemplos > 0 ? ` (${ejemplos} de ejemplo)` : ''}, ${fotos.length} fotos.`,
);
