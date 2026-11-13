/**
 * Página del carrito: lista con cantidades, subtotal, formulario del pedido y panel para enviarlo.
 * Los precios salen del catálogo publicado (no de lo guardado en el navegador).
 */
import type { Idioma } from '../lib/catalogo.ts';
import { calcularCarrito, CARRITO_VACIO, fijarCantidad, quitar, type LineaCalculada } from '../lib/carrito.ts';
import { formatearPrecio } from '../lib/formato.ts';
import { iconoSvg } from '../lib/iconos.ts';
import {
  armarMensajePedido,
  FORMAS_ENTREGA,
  necesitaDireccion,
  numeroDePedido,
  validarPedido,
  type DatosPedido,
  type FormaEntrega,
} from '../lib/pedido.ts';
import { textos } from '../i18n/textos.ts';
import {
  alCambiarCarrito,
  cargarCarrito,
  guardarElCarrito,
  guardarUltimoPedido,
  leerUltimoPedido,
} from './almacen.ts';
import { prepararEnvio } from './envio.ts';

interface DatoProducto {
  n: string;
  u: string;
  pf: number;
  pn: number;
  d: boolean;
  i: string;
}

const pagina = document.querySelector<HTMLElement>('[data-pagina-carrito]');

if (pagina) {
  const idioma: Idioma = document.documentElement.lang === 'en' ? 'en' : 'es';
  const t = textos(idioma);
  let datos: Record<string, DatoProducto> = {};
  try {
    datos = JSON.parse(document.getElementById('datos-carrito')?.textContent ?? '{}') as Record<string, DatoProducto>;
  } catch {
    datos = {};
  }
  const precios = new Map(Object.entries(datos).map(([sku, d]) => [sku, { precioFinal: d.pf, disponible: d.d }]));

  const $ = <T extends Element = HTMLElement>(selector: string) => pagina.querySelector<T>(selector);
  const cargando = $('[data-cargando]');
  const vacio = $('[data-vacio]');
  const contenido = $('[data-contenido]');
  const lineas = $('[data-lineas]');
  const retirados = $('[data-retirados]');
  const retiradosLista = $('[data-retirados-lista]');
  const subtotal = $('[data-subtotal]');
  const unidades = $('[data-unidades]');
  const hacerPedido = $<HTMLButtonElement>('[data-hacer-pedido]');
  const seccionPedido = $('[data-seccion-pedido]');
  const formulario = $<HTMLFormElement>('[data-formulario-pedido]');
  const avisoFormulario = $('[data-aviso-formulario]');
  const campoDireccion = $('[data-campo-direccion]');
  const etiquetaDireccion = $('[data-etiqueta-direccion]');
  const ayudaDireccion = $('[data-ayuda-direccion]');
  const confirmacion = $('[data-panel-envio]');
  const ultimo = $('[data-ultimo]');
  const ultimoTexto = $('[data-ultimo-texto]');

  let viendoConfirmacion = false;

  const escapar = (texto: string) =>
    texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

  function htmlLinea(l: LineaCalculada): string {
    const d = datos[l.sku];
    if (!d) return '';
    const nombre = escapar(d.n);
    const sku = escapar(l.sku);
    const antes = d.pn > d.pf ? ` <s>${formatearPrecio(d.pn)}</s>` : '';
    return `<li class="linea" data-sku="${sku}">
      <a class="linea__imagen" href="${escapar(d.u)}" tabindex="-1" aria-hidden="true"><img src="${escapar(d.i)}" alt="" width="400" height="300" loading="lazy" decoding="async"></a>
      <div class="linea__datos">
        <a class="linea__nombre" href="${escapar(d.u)}">${nombre}</a>
        <p class="sku">${sku}</p>
        <p class="linea__unitario">${formatearPrecio(l.precioUnitario)}${antes}</p>
      </div>
      <div class="linea__cantidad">
        <div class="cantidad__control">
          <button class="boton-icono" type="button" data-accion="restar" data-sku="${sku}" aria-label="${escapar(`${t.producto.restar}: ${d.n}`)}">${iconoSvg('menos', 18)}</button>
          <input class="cantidad__campo" type="number" inputmode="numeric" min="1" max="99" step="1" value="${l.cantidad}" data-accion="cantidad" data-sku="${sku}" aria-label="${escapar(t.carrito.cantidadDe(d.n))}">
          <button class="boton-icono" type="button" data-accion="sumar" data-sku="${sku}" aria-label="${escapar(`${t.producto.sumar}: ${d.n}`)}">${iconoSvg('mas', 18)}</button>
        </div>
      </div>
      <p class="linea__total">${formatearPrecio(l.total)}</p>
      <button class="linea__quitar" type="button" data-accion="quitar" data-sku="${sku}" aria-label="${escapar(t.carrito.quitarA11y(d.n))}">${iconoSvg('basura', 18)}<span aria-hidden="true">${t.carrito.quitar}</span></button>
    </li>`;
  }

  function pintar(): void {
    if (cargando) cargando.hidden = true;
    const calculado = calcularCarrito(cargarCarrito(), precios);
    const estaVacio = calculado.lineas.length === 0 && calculado.retiradas.length === 0;

    if (viendoConfirmacion) {
      if (vacio) vacio.hidden = true;
      if (contenido) contenido.hidden = true;
      return;
    }

    if (vacio) vacio.hidden = !estaVacio;
    if (contenido) contenido.hidden = estaVacio;
    if (estaVacio) {
      if (seccionPedido) seccionPedido.hidden = true;
      const anterior = leerUltimoPedido();
      if (ultimo) ultimo.hidden = !anterior;
      if (ultimoTexto && anterior) ultimoTexto.textContent = t.carrito.ultimoPedido(anterior.numero);
      return;
    }

    // Conservar el foco al volver a pintar las líneas.
    const activo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const foco = activo?.dataset.accion && activo.dataset.sku ? `[data-accion="${activo.dataset.accion}"][data-sku="${CSS.escape(activo.dataset.sku)}"]` : null;

    if (lineas) lineas.innerHTML = calculado.lineas.map(htmlLinea).join('');
    if (retirados && retiradosLista) {
      retirados.hidden = calculado.retiradas.length === 0;
      retiradosLista.innerHTML = calculado.retiradas
        .map((r) => {
          const nombre = datos[r.sku]?.n ?? r.sku;
          const motivo = r.motivo === 'agotado' ? t.producto.agotado : t.carrito.noExiste;
          return `<li><span>${escapar(nombre)} (${escapar(motivo)})</span><button class="linea__quitar" type="button" data-accion="quitar" data-sku="${escapar(r.sku)}" aria-label="${escapar(t.carrito.quitarA11y(nombre))}">${iconoSvg('basura', 18)}<span aria-hidden="true">${t.carrito.quitar}</span></button></li>`;
        })
        .join('');
    }
    if (subtotal) subtotal.textContent = formatearPrecio(calculado.subtotal);
    if (unidades) unidades.textContent = t.carrito.unidades(calculado.unidades);
    if (hacerPedido) hacerPedido.disabled = calculado.lineas.length === 0;

    if (foco) pagina?.querySelector<HTMLElement>(foco)?.focus();
  }

  // Cantidades y quitar
  pagina.addEventListener('click', (e) => {
    const boton = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-accion]') : null;
    const sku = boton?.dataset.sku;
    if (!boton || !sku || boton.tagName === 'INPUT') return;
    const carrito = cargarCarrito();
    const actual = carrito.lineas.find((l) => l.sku === sku)?.cantidad ?? 0;
    if (boton.dataset.accion === 'sumar') guardarElCarrito(fijarCantidad(carrito, sku, actual + 1));
    if (boton.dataset.accion === 'restar') guardarElCarrito(fijarCantidad(carrito, sku, Math.max(1, actual - 1)));
    if (boton.dataset.accion === 'quitar') {
      guardarElCarrito(quitar(carrito, sku));
      document.querySelector<HTMLElement>('[data-titulo-carrito]')?.focus();
    }
  });
  pagina.addEventListener('change', (e) => {
    const campo = e.target instanceof HTMLInputElement && e.target.dataset.accion === 'cantidad' ? e.target : null;
    if (!campo?.dataset.sku) return;
    const n = Number(campo.value);
    guardarElCarrito(fijarCantidad(cargarCarrito(), campo.dataset.sku, Number.isFinite(n) && n >= 1 ? n : 1));
  });

  // Formulario del pedido
  hacerPedido?.addEventListener('click', () => {
    if (!seccionPedido) return;
    seccionPedido.hidden = false;
    seccionPedido.querySelector<HTMLElement>('#titulo-pedido')?.focus();
    seccionPedido.scrollIntoView({ block: 'start' });
  });

  function leerFormulario(): DatosPedido {
    const f = formulario;
    const valor = (nombre: string) => (f?.elements.namedItem(nombre) as HTMLInputElement | null)?.value ?? '';
    const entrega = f?.querySelector<HTMLInputElement>('[name="entrega"]:checked')?.value ?? '';
    return {
      nombre: valor('nombre'),
      telefono: valor('telefono'),
      correo: valor('correo'),
      entrega: (FORMAS_ENTREGA as readonly string[]).includes(entrega) ? (entrega as FormaEntrega) : '',
      direccion: valor('direccion'),
      nota: valor('nota'),
    };
  }

  function ajustarDireccion(): void {
    const { entrega } = leerFormulario();
    if (campoDireccion) campoDireccion.hidden = !necesitaDireccion(entrega);
    if (etiquetaDireccion) etiquetaDireccion.textContent = entrega === 'cuba' ? t.pedido.destinoCuba : t.pedido.direccion;
    if (ayudaDireccion) ayudaDireccion.textContent = entrega === 'cuba' ? t.pedido.destinoCubaAyuda : t.pedido.direccionAyuda;
  }
  formulario?.addEventListener('change', (e) => {
    if (e.target instanceof HTMLInputElement && e.target.name === 'entrega') ajustarDireccion();
  });

  function mostrarErrores(errores: Partial<Record<keyof DatosPedido, string>>): void {
    if (!formulario) return;
    for (const salida of formulario.querySelectorAll<HTMLElement>('[data-error]')) {
      const campo = salida.dataset.error as keyof DatosPedido;
      const mensaje = errores[campo] ?? '';
      salida.innerHTML = mensaje ? `${iconoSvg('alerta', 16)}<span>${escapar(mensaje)}</span>` : '';
      for (const control of formulario.querySelectorAll<HTMLElement>(`[name="${campo}"]`)) {
        if (mensaje) control.setAttribute('aria-invalid', 'true');
        else control.removeAttribute('aria-invalid');
      }
    }
    if (avisoFormulario) avisoFormulario.textContent = Object.keys(errores).length > 0 ? t.formulario.revisar : '';
  }

  function mostrarConfirmacion(numero: string, texto: string, abrirWhatsapp: boolean): void {
    if (!confirmacion) return;
    viendoConfirmacion = true;
    if (vacio) vacio.hidden = true;
    if (contenido) contenido.hidden = true;
    if (seccionPedido) seccionPedido.hidden = true;
    const enlaceWhatsapp = prepararEnvio({
      panel: confirmacion,
      titulo: t.pedido.listo(numero),
      explicacion: t.pedido.listoTexto,
      texto,
      asunto: t.pedido.asunto(numero),
      whatsapp: pagina?.dataset.whatsapp ?? '',
      correo: pagina?.dataset.correo ?? '',
      textoCopiado: t.pedido.copiado,
      textoNoCopiado: t.pedido.noCopiado,
    });
    confirmacion.querySelector<HTMLElement>('[data-envio-titulo]')?.focus();
    confirmacion.scrollIntoView({ block: 'start' });
    if (abrirWhatsapp && enlaceWhatsapp) window.open(enlaceWhatsapp, '_blank', 'noopener');
  }

  formulario?.addEventListener('submit', (e) => {
    e.preventDefault();
    const datosPedido = leerFormulario();
    const errores = validarPedido(datosPedido, idioma);
    mostrarErrores(errores);
    const primero = (Object.keys(errores) as (keyof DatosPedido)[])[0];
    if (primero) {
      formulario.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
      return;
    }
    const carrito = cargarCarrito();
    const calculado = calcularCarrito(carrito, precios);
    if (calculado.lineas.length === 0) return;
    const numero = numeroDePedido();
    const texto = armarMensajePedido({
      idioma,
      numero,
      subtotal: calculado.subtotal,
      datos: datosPedido,
      lineas: calculado.lineas.map((l) => ({
        cantidad: l.cantidad,
        nombre: datos[l.sku]?.n ?? l.sku,
        sku: l.sku,
        precioUnitario: l.precioUnitario,
        total: l.total,
      })),
    });
    guardarUltimoPedido({ numero, texto, lineas: carrito.lineas, fecha: new Date().toISOString() });
    viendoConfirmacion = true;
    guardarElCarrito(CARRITO_VACIO);
    mostrarConfirmacion(numero, texto, true);
  });

  // Modificar: devuelve los productos del último pedido al carrito.
  pagina.querySelector('[data-modificar]')?.addEventListener('click', () => {
    const anterior = leerUltimoPedido();
    viendoConfirmacion = false;
    if (confirmacion) confirmacion.hidden = true;
    if (anterior) guardarElCarrito({ lineas: anterior.lineas });
    pintar();
    if (seccionPedido && formulario) seccionPedido.hidden = false;
    document.querySelector<HTMLElement>('[data-titulo-carrito]')?.focus();
  });

  pagina.querySelector('[data-ver-ultimo]')?.addEventListener('click', () => {
    const anterior = leerUltimoPedido();
    if (anterior) mostrarConfirmacion(anterior.numero, anterior.texto, false);
  });

  alCambiarCarrito(pintar);
  ajustarDireccion();
  pintar();
}
