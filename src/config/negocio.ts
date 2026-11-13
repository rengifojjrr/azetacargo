/**
 * Datos del negocio. Es el único lugar donde se escriben.
 *
 * Mientras `whatsapp` esté vacío, el sitio funciona como VERSIÓN DE PRUEBA:
 *   - se ve la franja «Versión de prueba» arriba,
 *   - el pedido se puede copiar en vez de abrir WhatsApp,
 *   - los buscadores no indexan el sitio (robots noindex).
 * Al poner el número, todo eso se apaga solo en la próxima publicación.
 */
export interface DatosNegocio {
  nombre: string;
  direccion: string;
  telefono: string;
  whatsapp: string;
  correo: string;
  horario: { es: string; en: string; esEjemplo: boolean };
  redes: { nombre: string; url: string }[];
  marketplace: string;
}

export const negocio: DatosNegocio = {
  nombre: 'Azeta Cargo',
  /** Dirección pública. Por ahora solo la ciudad. */
  direccion: 'Miami, FL',
  /** Teléfono para mostrar, tal como se lee. Ejemplo: '(305) 555-0123'. PENDIENTE. */
  telefono: '',
  /** WhatsApp que recibe los pedidos: solo números, con código de país. Ejemplo: '13055550123'. PENDIENTE. */
  whatsapp: '',
  /** Correo que recibe los pedidos. Ejemplo: 'pedidos@azetacargo.com'. PENDIENTE. */
  correo: '',
  /** Horario de atención. DATO DE EJEMPLO hasta que Azeta confirme el real. */
  horario: {
    es: 'Lunes a viernes, 9:00 a. m. a 6:00 p. m.',
    en: 'Monday to Friday, 9:00 a.m. to 6:00 p.m.',
    esEjemplo: true,
  },
  /** Redes sociales: [{ nombre: 'Instagram', url: 'https://…' }]. PENDIENTE. */
  redes: [],
  /** El marketplace de Azeta (otro proyecto). */
  marketplace: 'https://azeta.app',
};

/** Sin WhatsApp el sitio es una versión de prueba. */
export const esVersionDePrueba = negocio.whatsapp.replace(/\D/g, '') === '';
