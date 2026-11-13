/**
 * Filtros, orden y búsqueda del catálogo, sobre las tarjetas que ya vienen en la página.
 * La búsqueda usa el índice JSON generado al compilar (/indice.json). El estado vive en la dirección
 * (?q=…&marca=…&min=…&max=…&disponible=1&orden=…) para poder compartirla y volver atrás.
 */
import type { Idioma } from '../lib/catalogo.ts';
import {
  contarMarcas,
  CRITERIOS_VACIOS,
  criteriosAUrl,
  criteriosDesdeUrl,
  filtrar,
  hayFiltros,
  type Criterios,
  type Orden,
  type ProductoFiltrable,
  type TextoBusqueda,
} from '../lib/filtros.ts';
import type { Indice } from '../lib/indice.ts';
import { normalizar } from '../lib/texto.ts';
import { textos } from '../i18n/textos.ts';

const raiz = document.querySelector<HTMLElement>('[data-catalogo]');
const lista = document.querySelector<HTMLElement>('[data-lista-productos]');
const formulario = document.querySelector<HTMLFormElement>('[data-formulario-filtros]');
const selectorOrden = document.querySelector<HTMLSelectElement>('[data-orden]');

if (raiz && lista && formulario && selectorOrden) {
  const idioma: Idioma = document.documentElement.lang === 'en' ? 'en' : 'es';
  const t = textos(idioma);

  interface Item extends ProductoFiltrable {
    celda: HTMLLIElement;
  }

  const items: Item[] = [...lista.querySelectorAll<HTMLLIElement>(':scope > li')].flatMap((celda) => {
    const d = celda.querySelector<HTMLElement>('[data-producto]')?.dataset;
    if (!d?.sku) return [];
    return [
      {
        celda,
        sku: d.sku,
        categoria: '',
        marca: d.marca ?? '',
        precio: Number(d.precio),
        disponible: d.disponible === '1',
        nuevo: d.nuevo === '1',
        destacado: d.destacado === '1',
        orden: Number(d.orden),
      },
    ];
  });

  // Textos de búsqueda: del índice JSON; si no carga, de lo que dice cada tarjeta.
  let textosBusqueda: Map<string, TextoBusqueda> | null = null;
  async function cargarTextos(): Promise<Map<string, TextoBusqueda>> {
    if (textosBusqueda) return textosBusqueda;
    try {
      const respuesta = await fetch(raiz?.dataset.indice ?? '');
      if (!respuesta.ok) throw new Error(String(respuesta.status));
      const indice = (await respuesta.json()) as Indice;
      textosBusqueda = new Map(indice.productos.map((p) => [p.sku, p.busqueda[idioma]]));
    } catch {
      textosBusqueda = new Map(
        items.map((item) => {
          const tarjeta = item.celda.querySelector('[data-producto]');
          return [
            item.sku,
            {
              nombre: normalizar(tarjeta?.querySelector('.tarjeta__nombre')?.textContent ?? ''),
              resto: normalizar(`${item.sku} ${item.marca} ${tarjeta?.textContent ?? ''}`),
            },
          ];
        }),
      );
    }
    return textosBusqueda;
  }

  const campo = <T extends Element>(selector: string) => formulario.querySelector<T>(selector);
  const minimo = campo<HTMLInputElement>('[name="min"]');
  const maximo = campo<HTMLInputElement>('[name="max"]');
  const disponible = campo<HTMLInputElement>('[name="disponible"]');
  const casillasMarca = [...formulario.querySelectorAll<HTMLInputElement>('[name="marca"]')];
  let busqueda = '';

  const numero = (valor: string | undefined) => {
    if (!valor || valor.trim() === '') return null;
    const n = Number(valor);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  function leerControles(): Criterios {
    return {
      q: busqueda,
      marcas: casillasMarca.filter((c) => c.checked).map((c) => c.value),
      min: numero(minimo?.value),
      max: numero(maximo?.value),
      soloDisponibles: disponible?.checked ?? false,
      orden: selectorOrden?.value as Orden,
    };
  }

  function ponerControles(c: Criterios): void {
    busqueda = c.q;
    for (const casilla of casillasMarca) casilla.checked = c.marcas.includes(casilla.value);
    if (minimo) minimo.value = c.min === null ? '' : String(c.min);
    if (maximo) maximo.value = c.max === null ? '' : String(c.max);
    if (disponible) disponible.checked = c.soloDisponibles;
    if (selectorOrden) selectorOrden.value = c.orden;
  }

  async function aplicar(c: Criterios, actualizarDireccion = true): Promise<void> {
    const textosActuales = c.q ? await cargarTextos() : undefined;
    const visibles = filtrar(items, c, textosActuales);
    const quedan = new Set(visibles.map((v) => v.sku));
    for (const v of visibles) lista?.append(v.celda);
    for (const item of items) item.celda.hidden = !quedan.has(item.sku);

    const cuenta = document.querySelector('[data-cuenta-resultados]');
    if (cuenta) cuenta.textContent = t.catalogo.productos(visibles.length);

    const porMarca = contarMarcas(items, c, textosActuales);
    for (const contador of document.querySelectorAll<HTMLElement>('[data-cuenta-marca]')) {
      contador.textContent = String(porMarca.get(contador.dataset.cuentaMarca ?? '') ?? 0);
    }

    const vacio = document.querySelector<HTMLElement>('[data-vacio]');
    const vacioTexto = document.querySelector('[data-vacio-texto]');
    if (vacio) vacio.hidden = visibles.length > 0;
    if (vacioTexto) vacioTexto.textContent = c.q && !hayFiltros(c) ? t.catalogo.vacioBusqueda(c.q) : t.catalogo.vacio;

    const cabeceraBusqueda = document.querySelector<HTMLElement>('[data-busqueda]');
    const textoBusqueda = document.querySelector('[data-busqueda-texto]');
    if (cabeceraBusqueda) cabeceraBusqueda.hidden = c.q === '';
    if (textoBusqueda) textoBusqueda.textContent = c.q ? t.catalogo.resultadosPara(c.q) : '';

    const consulta = criteriosAUrl(c).toString();
    for (const enlace of document.querySelectorAll<HTMLAnchorElement>('[data-enlace-categoria]')) {
      enlace.href = `${enlace.dataset.base ?? enlace.pathname}${consulta ? `?${consulta}` : ''}`;
    }
    const quitarBusqueda = document.querySelector<HTMLAnchorElement>('[data-quitar-busqueda]');
    if (quitarBusqueda) {
      const sinBusqueda = criteriosAUrl({ ...c, q: '' }).toString();
      quitarBusqueda.href = `${location.pathname}${sinBusqueda ? `?${sinBusqueda}` : ''}`;
    }
    const idiomaEnlace = document.querySelector<HTMLAnchorElement>('[data-cambiar-idioma]');
    if (idiomaEnlace) idiomaEnlace.href = `${idiomaEnlace.href.split('?')[0]}${consulta ? `?${consulta}` : ''}`;

    if (actualizarDireccion) {
      history.replaceState(null, '', `${location.pathname}${consulta ? `?${consulta}` : ''}`);
    }
  }

  // Al cargar: lo que diga la dirección.
  const inicial = criteriosDesdeUrl(new URLSearchParams(location.search));
  ponerControles(inicial);
  void aplicar(inicial, false);

  let espera: number | undefined;
  formulario.addEventListener('submit', (e) => e.preventDefault());
  formulario.addEventListener('change', () => void aplicar(leerControles()));
  formulario.addEventListener('input', (e) => {
    if (e.target === minimo || e.target === maximo) {
      window.clearTimeout(espera);
      espera = window.setTimeout(() => void aplicar(leerControles()), 350);
    }
  });
  selectorOrden.addEventListener('change', () => void aplicar(leerControles()));

  const quitarFiltros = () => {
    ponerControles({ ...CRITERIOS_VACIOS, q: busqueda, orden: selectorOrden.value as Orden });
    void aplicar(leerControles());
  };
  document.querySelector('[data-quitar-filtros]')?.addEventListener('click', quitarFiltros);
  document.querySelector('[data-quitar-todo]')?.addEventListener('click', () => {
    ponerControles({ ...CRITERIOS_VACIOS, orden: selectorOrden.value as Orden });
    const buscador = document.querySelector<HTMLInputElement>('[data-buscador]');
    if (buscador) buscador.value = '';
    void aplicar(leerControles());
  });

  // Panel de filtros en el teléfono
  const alternar = document.querySelector<HTMLButtonElement>('[data-alternar-filtros]');
  const panel = document.querySelector<HTMLElement>('[data-panel-filtros]');
  const abrirPanel = (abierto: boolean) => {
    if (!alternar || !panel) return;
    alternar.setAttribute('aria-expanded', String(abierto));
    panel.toggleAttribute('data-abierto', abierto);
  };
  alternar?.addEventListener('click', () => abrirPanel(alternar.getAttribute('aria-expanded') !== 'true'));
  document.querySelector('[data-cerrar-filtros]')?.addEventListener('click', () => {
    abrirPanel(false);
    alternar?.focus();
    document.querySelector('[data-cuenta-resultados]')?.scrollIntoView({ block: 'start' });
  });
}
