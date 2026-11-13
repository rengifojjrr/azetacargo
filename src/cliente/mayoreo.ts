/** Formulario de cotización de mayoreo y carga: valida, arma la solicitud y la deja lista para enviar. */
import type { Idioma } from '../lib/catalogo.ts';
import { iconoSvg } from '../lib/iconos.ts';
import {
  armarMensajeCotizacion,
  DESTINOS_COTIZACION,
  numeroDePedido,
  PLAZOS_COTIZACION,
  TIPOS_COTIZACION,
  UNIDADES_COTIZACION,
  validarCotizacion,
  type DatosCotizacion,
} from '../lib/pedido.ts';
import { textos } from '../i18n/textos.ts';
import { prepararEnvio } from './envio.ts';

const pagina = document.querySelector<HTMLElement>('[data-pagina-mayoreo]');
const formulario = pagina?.querySelector<HTMLFormElement>('[data-formulario-cotizacion]');

if (pagina && formulario) {
  const idioma: Idioma = document.documentElement.lang === 'en' ? 'en' : 'es';
  const t = textos(idioma);
  const seccion = pagina.querySelector<HTMLElement>('[data-seccion-cotizacion]');
  const panel = pagina.querySelector<HTMLElement>('[data-panel-envio]');
  const aviso = pagina.querySelector<HTMLElement>('[data-aviso-formulario]');

  const valor = (nombre: string) =>
    (formulario.elements.namedItem(nombre) as HTMLInputElement | HTMLSelectElement | null)?.value ?? '';
  const elegir = <T extends string>(lista: readonly T[], v: string): T | '' =>
    (lista as readonly string[]).includes(v) ? (v as T) : '';

  function leer(): DatosCotizacion {
    return {
      tipo: elegir(TIPOS_COTIZACION, valor('tipo')),
      descripcion: valor('descripcion'),
      cantidad: valor('cantidad'),
      unidad: elegir(UNIDADES_COTIZACION, valor('unidad')) || 'unidades',
      destino: elegir(DESTINOS_COTIZACION, valor('destino')),
      ciudad: valor('ciudad'),
      plazo: elegir(PLAZOS_COTIZACION, valor('plazo')),
      nombre: valor('nombre'),
      empresa: valor('empresa'),
      telefono: valor('telefono'),
      correo: valor('correo'),
      nota: valor('nota'),
    };
  }

  // Si viene de una ficha (?sku=…), se rellena qué necesita.
  const sku = new URLSearchParams(location.search).get('sku')?.toUpperCase();
  if (sku) {
    try {
      const nombres = JSON.parse(document.getElementById('nombres-productos')?.textContent ?? '{}') as Record<string, string>;
      const nombre = nombres[sku];
      const descripcion = formulario.elements.namedItem('descripcion') as HTMLTextAreaElement | null;
      const tipo = formulario.elements.namedItem('tipo') as HTMLSelectElement | null;
      if (nombre && descripcion && !descripcion.value) descripcion.value = t.mayoreo.deProducto(nombre, sku);
      if (nombre && tipo && !tipo.value) tipo.value = 'productos';
    } catch {
      // Sin datos: el formulario queda vacío.
    }
  }

  // La ciudad no hace falta si se recoge en Miami; para Cuba se pide provincia y municipio.
  const campoCiudad = pagina.querySelector<HTMLElement>('[data-campo-ciudad]');
  const etiquetaCiudad = pagina.querySelector<HTMLElement>('[data-etiqueta-ciudad]');
  function ajustarCiudad(): void {
    const destino = valor('destino');
    if (campoCiudad) campoCiudad.hidden = destino === 'miami';
    if (etiquetaCiudad) etiquetaCiudad.textContent = destino === 'cuba' ? t.mayoreo.ciudadCuba : t.mayoreo.ciudad;
  }
  formulario.addEventListener('change', (e) => {
    if (e.target instanceof HTMLSelectElement && e.target.name === 'destino') ajustarCiudad();
  });
  ajustarCiudad();

  const escapar = (texto: string) =>
    texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = leer();
    const errores = validarCotizacion(datos, idioma);
    for (const salida of formulario.querySelectorAll<HTMLElement>('[data-error]')) {
      const campo = salida.dataset.error as keyof DatosCotizacion;
      const mensaje = errores[campo] ?? '';
      salida.innerHTML = mensaje ? `${iconoSvg('alerta', 16)}<span>${escapar(mensaje)}</span>` : '';
      const control = formulario.querySelector<HTMLElement>(`[name="${campo}"]`);
      if (mensaje) control?.setAttribute('aria-invalid', 'true');
      else control?.removeAttribute('aria-invalid');
    }
    const primero = Object.keys(errores)[0];
    if (aviso) aviso.textContent = primero ? t.formulario.revisar : '';
    if (primero) {
      formulario.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
      return;
    }
    if (!panel) return;
    const numero = numeroDePedido();
    const texto = armarMensajeCotizacion({ idioma, numero, datos });
    if (seccion) seccion.hidden = true;
    const enlace = prepararEnvio({
      panel,
      titulo: t.mayoreo.listo(numero),
      explicacion: t.mayoreo.listoTexto,
      texto,
      asunto: t.mayoreo.asunto(numero),
      whatsapp: pagina.dataset.whatsapp ?? '',
      correo: pagina.dataset.correo ?? '',
      textoCopiado: t.mayoreo.copiado,
      textoNoCopiado: t.pedido.noCopiado,
    });
    panel.querySelector<HTMLElement>('[data-envio-titulo]')?.focus();
    panel.scrollIntoView({ block: 'start' });
    if (enlace) window.open(enlace, '_blank', 'noopener');
  });

  pagina.querySelector('[data-nueva-solicitud]')?.addEventListener('click', () => {
    formulario.reset();
    ajustarCiudad();
    if (panel) panel.hidden = true;
    if (seccion) seccion.hidden = false;
    seccion?.querySelector<HTMLElement>('h2')?.focus();
  });
}
