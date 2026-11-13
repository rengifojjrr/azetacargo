/**
 * Panel para enviar un pedido o una solicitud ya armados: WhatsApp (si hay número), correo (si hay correo)
 * y copiar el texto (siempre, y es lo único que queda en la versión de prueba).
 */
import { urlCorreo, urlWhatsApp } from '../lib/pedido.ts';

export interface DatosEnvio {
  panel: HTMLElement;
  titulo: string;
  explicacion: string;
  texto: string;
  asunto: string;
  whatsapp: string;
  correo: string;
  textoCopiado: string;
  textoNoCopiado: string;
}

/** Plan B para navegadores sin portapapeles moderno (o sin permiso): copia lo que esté seleccionado. */
function copiarConSeleccion(): boolean {
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  }
}

async function copiarAlPortapapeles(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const copiado = copiarConSeleccion();
    area.remove();
    return copiado;
  }
}

const copiadores = new WeakMap<HTMLElement, () => void>();

/** Llena el panel y devuelve el enlace de WhatsApp (o null si no hay número). */
export function prepararEnvio(d: DatosEnvio): string | null {
  const el = <T extends Element>(selector: string) => d.panel.querySelector<T>(selector);
  const titulo = el<HTMLElement>('[data-envio-titulo]');
  const explicacion = el<HTMLElement>('[data-envio-explicacion]');
  const texto = el<HTMLElement>('[data-envio-texto]');
  const whatsapp = el<HTMLAnchorElement>('[data-enviar-whatsapp]');
  const correo = el<HTMLAnchorElement>('[data-enviar-correo]');
  const copiar = el<HTMLButtonElement>('[data-copiar]');
  const estado = el<HTMLElement>('[data-estado-copia]');
  const nota = el<HTMLElement>('[data-nota-prueba]');

  const urlWa = urlWhatsApp(d.whatsapp, d.texto);
  const urlMail = urlCorreo(d.correo, d.asunto, d.texto);

  if (titulo) titulo.textContent = d.titulo;
  if (explicacion) {
    explicacion.textContent = d.explicacion;
    explicacion.hidden = !urlWa && !urlMail;
  }
  if (texto) texto.textContent = d.texto;
  if (nota) nota.hidden = Boolean(urlWa || urlMail);
  if (whatsapp) {
    whatsapp.hidden = !urlWa;
    if (urlWa) whatsapp.href = urlWa;
  }
  if (correo) {
    correo.hidden = !urlMail;
    if (urlMail) correo.href = urlMail;
  }
  if (estado) estado.textContent = '';
  if (copiar) {
    const anterior = copiadores.get(copiar);
    if (anterior) copiar.removeEventListener('click', anterior);
    const alCopiar = () => {
      void copiarAlPortapapeles(d.texto).then((ok) => {
        if (estado) estado.textContent = ok ? d.textoCopiado : d.textoNoCopiado;
      });
    };
    copiadores.set(copiar, alCopiar);
    copiar.addEventListener('click', alCopiar);
  }
  d.panel.hidden = false;
  return urlWa;
}
