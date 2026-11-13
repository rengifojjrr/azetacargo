# Pendientes

Lo que falta para pasar de la versión de prueba a la tienda real. Lo que se decidió sin poder preguntar está al final,
para revisarlo.

## Datos que tiene que dar Azeta

- [ ] **WhatsApp que recibe los pedidos** (`src/config/negocio.ts` › `whatsapp`, solo números con código de país).
      Mientras esté vacío: se ve la franja «Versión de prueba», el pedido solo se puede copiar (no abre WhatsApp) y el
      sitio lleva `noindex` para que los buscadores no lo muestren. Al ponerlo, todo eso se apaga solo.
- [ ] **Correo que recibe los pedidos** (`negocio.ts` › `correo`). Activa el botón «Enviar por correo».
- [ ] **Teléfono** público y **dirección exacta** para recoger (hoy solo «Miami, FL»).
- [ ] **Horario** real (hoy hay uno de ejemplo, marcado «horario de ejemplo» en el sitio).
- [ ] **Redes sociales** (`negocio.ts` › `redes`).
- [ ] **El resto de la lista de productos.** El mensaje del 12/11/2026 se cortó al final; lo último que llegó fue
      «bicicletas de adulto y de niño». Puede haber más categorías.
- [ ] **Precios e inventario reales.** Hoy hay 42 productos de ejemplo con precios de ejemplo y marcas de ejemplo
      («Marca A»…«Marca E»).
- [ ] **Fotos** de los productos (hoy se ven dibujos de línea por categoría). Cómo subirlas:
      [COMO-CAMBIAR-PRODUCTOS.md](COMO-CAMBIAR-PRODUCTOS.md).
- [ ] **Logo final.** El de hoy es provisional: AZETA / CARGO con un colibrí geométrico, inspirado en la referencia del
      colibrí de la marca.
- [ ] **Dominio `azetacargo.com`:** quién lo tiene y acceso a su DNS. Los pasos están en [DOMINIO.md](DOMINIO.md).
- [ ] **Forma de cobro.** Esta versión no cobra en línea: el pedido llega por WhatsApp o correo y se cobra después.
      Más adelante: enlaces de pago o una pasarela.
- [ ] **Textos legales.** Términos y Privacidad son borradores marcados «Borrador — revisar con abogado». Falta definir
      la política de devoluciones y garantías.
- [ ] **Cuba:** revisar con abogado qué productos y qué forma de pago se pueden ofrecer para Cuba (normas de EE. UU.)
      antes de anunciarlo. Hoy el sitio solo ofrece «Envío a Cuba por Azeta Cargo — se cotiza aparte», sin hablar de
      pagos, entregas, licencias ni permisos.
- [ ] **Azeta Marketplace (azeta.app):** es otro proyecto; aquí solo hay un enlace «próximamente».

## Decisiones tomadas por ser lo más conservador (revisar)

- **Precio en oferta:** el naranja de la marca sobre blanco no alcanza el contraste mínimo para texto (2,7:1; AA pide
  4,5:1). El precio de oferta va en negro con una raya naranja debajo, el precio anterior tachado y la insignia
  naranja «Oferta» con letras azul marino (5,6:1).
- **Rojo para errores:** la paleta no tiene rojo; se agregó uno solo (`--color-error`, 6,5:1 sobre blanco) para los
  mensajes de error de los formularios.
- **Direcciones en inglés traducidas:** `/en/shop/energia/`, `/en/product/az-ene-001/`, `/en/cart/`. El código de la
  categoría y el SKU son los mismos en los dos idiomas.
- **Pedido:** nombre y teléfono obligatorios; correo opcional. La dirección se pide solo para envíos; para Cuba solo
  provincia y municipio. Al confirmar se vacía el carrito, se guarda el último pedido y se puede «Modificar pedido».
- **Número de pedido:** fecha de Miami + 4 letras sin I ni O (para que no se confundan con 1 y 0 al dictarlo), por
  ejemplo `20261113-KQTZ`. Las cotizaciones usan el mismo formato.
- **Características en inglés:** se traducen con `catalogo/glosario.csv` en vez de agregar columnas al CSV.
- **`categorias.csv`** lleva además `descripcion_es` y `descripcion_en` (para las tarjetas de categoría y los
  buscadores).
- **Destino Cuba en mayoreo:** igual que en el pedido, «Cuba — se cotiza aparte».
- **Productos agotados:** se muestran (atenuados y al final) pero no se pueden agregar al carrito.
- **Sin cookies ni analítica.** El carrito vive solo en el navegador (`localStorage`).
