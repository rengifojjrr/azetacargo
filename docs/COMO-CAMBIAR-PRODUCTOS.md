# Cómo cambiar los productos

Todos los productos están en un archivo que se abre en Excel: **`catalogo/productos.csv`**. Cada fila es un producto.
No hace falta programar ni instalar nada: se hace desde la página de GitHub.

## Cambiar precios, nombres o agregar productos

1. Entra a <https://github.com/rengifojjrr/azetacargo/blob/main/catalogo/productos.csv>.
2. Toca el botón de descarga (**Download raw file**) y abre el archivo en Excel.
3. Cambia lo que necesites. Para agregar un producto, agrega una fila nueva.
4. Guárdalo con **Archivo › Guardar como › «CSV UTF-8 (delimitado por comas)»**, con el mismo nombre `productos.csv`.
   (Si se guarda como «CSV» a secas, los acentos salen dañados y la publicación se detiene avisándolo.)
5. En GitHub, entra a la carpeta `catalogo` › **Add file** › **Upload files**, arrastra `productos.csv` y toca
   **Commit changes**.
6. Espera unos 4 minutos y recarga la tienda. El avance se ve en la pestaña **Actions** del repositorio:
   amarillo = trabajando, verde = publicado, rojo = hay un error (ver abajo).

## Qué va en cada columna

| Columna | Qué va | Ejemplo |
| --- | --- | --- |
| `sku` | Código único del producto: letras, números y guiones, sin espacios. Es también su dirección: `/producto/az-ene-001/` | `AZ-ENE-001` |
| `categoria` | Una de las de `categorias.csv`: `electronica`, `energia`, `hogar`, `herramientas`, `auto`, `oficina`, `bicicletas` | `energia` |
| `nombre_es` | Nombre en español (obligatorio) | `Estación de energía portátil 1 000 Wh` |
| `nombre_en` | Nombre en inglés (si falta, se usa el español) | `Portable power station 1,000 Wh` |
| `marca` | Marca (puede ir vacía) | `Marca A` |
| `precio_usd` | Precio en dólares (obligatorio) | `699.00` |
| `precio_oferta_usd` | Precio de oferta; vacío si no hay oferta. Debe ser menor que el precio | `599.00` |
| `disponible` | `sí` o `no` (obligatorio). Con `no` se ve «Agotado» y no se puede agregar | `sí` |
| `destacado` | `sí` para que salga en «Destacados» de la portada | `no` |
| `nuevo` | `sí` para la insignia «Nuevo» | `no` |
| `descripcion_es` | Una o dos frases en español | |
| `descripcion_en` | Lo mismo en inglés (si falta, se usa el español) | |
| `caracteristicas` | Pares `clave: valor` separados por `\|` | `Capacidad: 1 000 Wh \| Peso: 11 kg` |
| `fotos` | Normalmente vacío (ver «Fotos»). Si se quieren otros nombres, van separados por `\|` | `estacion-frente.jpg \| estacion-lado.jpg` |
| `ejemplo` | `sí` solo para los productos de ejemplo | `no` |

Los precios se pueden escribir `1299`, `1299.99`, `$1,299.99` o `1.299,99`.

## Fotos

1. Nombra cada foto con el SKU y un número: `AZ-ENE-001-1.jpg`, `AZ-ENE-001-2.jpg`… La `-1` es la principal.
2. En GitHub, entra a `public/productos` › **Add file** › **Upload files**, arrastra las fotos y toca **Commit changes**.
3. Listo: el sitio las encuentra solas y las optimiza al publicar (las achica y crea versiones WebP).

Consejos: fotos horizontales (4:3), sobre fondo claro, en JPG. Mientras un producto no tenga foto se ve un dibujo de
línea de su categoría. **Nunca uses fotos bajadas de internet.** Las fotos del teléfono pueden guardar la ubicación: el
sitio publicado se la quita, pero el archivo original queda en el repositorio, que es público; lo mejor es desactivar la
ubicación de la cámara antes de tomarlas.

## Si algo sale mal

Si un CSV tiene un error, la publicación se detiene y **la tienda sigue como estaba**. En **Actions**, abre la
publicación en rojo y el paso **«Revisar el catálogo (CSV)»**. Ahí dice el archivo, la fila (la misma que muestra
Excel), el SKU y el campo, por ejemplo:

```
✗ catalogo/productos.csv · fila 12 · AZ-HOG-002 · precio_usd: debe ser un número mayor que 0, por ejemplo 129.99
```

Corrige esa celda, vuelve a subir el archivo y listo.

## Productos de ejemplo

Los 42 productos de hoy son **de ejemplo** (columna `ejemplo` = `sí`) y por eso la tienda muestra la franja «Precios y
productos de ejemplo». Al cargar los reales, borra las filas de ejemplo (o pon `no` en esa columna): la franja
desaparece sola cuando ya no queda ninguno de ejemplo.

## Categorías

Están en `catalogo/categorias.csv`: `id` (sin acentos, va en la dirección), `nombre_es`, `nombre_en`, `icono`
(`movil`, `energia`, `hogar`, `herramientas`, `auto`, `oficina`, `bicicleta`, `caja`, `cuadricula`…), `orden`,
`descripcion_es` y `descripcion_en`.

## Características en inglés

La tienda en inglés traduce las características con `catalogo/glosario.csv` (columnas `es` y `en`): primero busca el
texto completo («Acero inoxidable» → «Stainless steel») y si no, palabra por palabra («pulgadas» → «in»). Los números
se pasan solos al formato inglés («1 000» → «1,000» y «1,5» → «1.5»). Si aparece una palabra nueva, al publicar sale
un aviso (no detiene nada) y en inglés se ve igual que en español hasta que se agregue al glosario.
