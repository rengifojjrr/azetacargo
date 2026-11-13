# Avance

## 13/11/2026 · Primera versión publicada (versión de prueba)

En línea en <https://rengifojjrr.github.io/azetacargo/>, en español (raíz) y en inglés (`/en/`).

### Qué hay

- **Inicio:** título, «Cómo comprar» en tres pasos, las 7 categorías con ícono, 8 destacados, franja «Mayoreo y
  carga» y pie con contacto, horario, enlaces legales y «Azeta Marketplace — próximamente» (enlaza a azeta.app).
- **Catálogo** (`/tienda/` y `/tienda/<categoria>/`): filtros por categoría, marca, rango de precio y disponibilidad;
  orden por relevancia, precio y novedad; búsqueda sin servidor con un índice JSON (`/indice.json`) que entiende
  palabras sin acentos y en plural. Los filtros quedan en la dirección (se pueden compartir y sobreviven al recargar).
- **Ficha** (`/producto/<sku>/`): fotos o dibujo, precio, disponibilidad, cantidad, «Agregar al carrito», tabla de
  características, formas de entrega, relacionados y datos estructurados `schema.org/Product` y `BreadcrumbList`.
- **Carrito y pedido:** carrito en `localStorage` (con `try/catch`; sin almacenamiento sigue en memoria), precios
  siempre del catálogo publicado, formulario con validación clara, número de pedido (fecha + 4 letras) y mensaje listo
  para WhatsApp (`wa.me`), correo (`mailto:`) o copiar. Sin pago en línea, y se dice claro.
- **Mayoreo y carga** (`/mayoreo/`): cotización de qué, cuánto, a dónde y para cuándo, que sale igual que el pedido.
  Desde una ficha, «Pide una cotización» llega con el producto ya escrito.
- **Envíos, Nosotros, Contacto, Preguntas frecuentes** (con datos `FAQPage`), **Términos** y **Privacidad** (borradores
  marcados «Borrador — revisar con abogado») y **404** con enlace a la tienda.
- **Versión de prueba:** sin WhatsApp configurado se ve la franja «Versión de prueba», el pedido se copia y todas las
  páginas llevan `noindex`. Con 42 productos de ejemplo se ve «Precios y productos de ejemplo».
- **Diseño:** esquinas rectas en todo (2 px solo en los campos), colores de la marca en `src/estilos/tokens.css`,
  IBM Plex Sans / Sans Condensed / Mono servidas desde el sitio, retícula de 12 columnas a 1240 px, celdas con línea
  fina, íconos de línea de 1,5 px con puntas cuadradas en un solo archivo, sin emojis, movimiento mínimo y respeto por
  «reducir movimiento». Logo provisional con colibrí geométrico. Imagen para compartir (`compartir.png`) e ícono de
  pestaña generados con los mismos colores.
- **Catálogo en CSV** validado con zod al compilar: cada error dice archivo, fila, SKU y campo, y no se publica nada
  roto. Fotos en `public/productos/`, optimizadas al publicar (WebP 480/960 px, sin metadatos).
- **Publicación:** GitHub Actions revisa, prueba, compila y publica en GitHub Pages en cada push a `main`. La dirección
  del sitio se cambia en una sola variable (`sitio.config.mjs`) para pasar a `azetacargo.com`.

### Cómo se probó

| Prueba | Resultado |
| --- | --- |
| `npm run check` (astro check + eslint) | 0 errores, 0 avisos |
| `npm test` (Vitest: CSV, precios, carrito, número de pedido, mensajes, filtros, rutas, colores) | 53 pruebas OK |
| `npm run test:compilado` (dist/: `border-radius` ≤ 2 px, hex solo en tokens, fuentes propias, sin `CNAME`, idioma/título/descripción/hreflang en cada página, `schema.org/Product` en cada ficha, índice JSON) | 9 pruebas OK |
| `npm run test:e2e` (Playwright, 390 × 844 y 1280 × 800): recorrido Tienda → Energía → Agregar → Carrito → Hacer pedido, ficha con cantidad, agotados, filtros, orden, búsqueda, idiomas, pedido en inglés, cotización, páginas, 404, sin menciones de pagos o licencias para Cuba, y axe (WCAG 2.2 AA) en 8 páginas | 49 pruebas OK |
| Lighthouse móvil (local) en inicio, catálogo y ficha | Rendimiento 99 · Accesibilidad 100 · Buenas prácticas 100 · SEO 66 (solo por el `noindex` de la versión de prueba) |
