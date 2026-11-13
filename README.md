# azetacargo.com · Tienda en línea de Azeta Cargo

Sitio estático de la tienda de Azeta Cargo (Miami): catálogo, ficha de cada producto, carrito y pedido por WhatsApp o
correo (sin pago en línea), y cotizaciones de mayoreo y carga. En español (raíz) y en inglés (`/en/`).

- **En línea:** https://rengifojjrr.github.io/azetacargo/ (pasará a `azetacargo.com`, ver [docs/DOMINIO.md](docs/DOMINIO.md)).
- **Cambiar productos:** [docs/COMO-CAMBIAR-PRODUCTOS.md](docs/COMO-CAMBIAR-PRODUCTOS.md).
- **Qué falta:** [docs/PENDIENTES.md](docs/PENDIENTES.md). **Qué se hizo y cómo se probó:** [docs/AVANCE.md](docs/AVANCE.md).

## Correrlo en la computadora

Hace falta Node 24 (ver `.nvmrc`).

```bash
npm install
npm run dev          # http://localhost:4321/azetacargo/
```

## Pruebas

```bash
npm run validar      # revisa los CSV del catálogo
npm run check        # tipos (astro check) y lint (eslint)
npm test             # lógica: CSV, carrito, número de pedido, mensaje, filtros, colores (Vitest)
npm run build        # compila en dist/
npm run test:compilado   # revisa dist/: esquinas de máximo 2 px, colores, fuentes propias, schema.org…
npx playwright install chromium   # una sola vez
npm run test:e2e     # recorridos con Playwright a 390 y 1280 px, y accesibilidad con axe
```

`npm run probar-todo` corre todo en orden.

## Publicar

Cada push a `main` revisa, prueba, compila y publica en GitHub Pages
([.github/workflows/publicar.yml](.github/workflows/publicar.yml)). Si algo falla, no se publica nada y el sitio sigue
como estaba.

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| Productos, categorías y traducciones de las características | `catalogo/productos.csv`, `catalogo/categorias.csv`, `catalogo/glosario.csv` |
| Fotos de productos | `public/productos/<sku>-1.jpg`, `-2.jpg`… |
| WhatsApp, correo, teléfono, dirección, horario | `src/config/negocio.ts` |
| Dirección del sitio (para pasar al dominio) | `sitio.config.mjs` |
| Colores, letras y medidas | `src/estilos/tokens.css` (único archivo con colores) |
| Íconos | `src/lib/iconos.ts` |
| Textos de la interfaz en los dos idiomas | `src/i18n/textos.ts` |
| Páginas | `src/vistas/` (contenido) y `src/pages/` (direcciones en español e inglés) |
| Imagen para compartir en redes | `public/compartir.png` (se regenera con `npx tsx scripts/imagen-compartir.ts`) |
