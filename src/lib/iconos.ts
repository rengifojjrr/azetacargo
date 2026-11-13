/**
 * Todos los íconos del sitio, en un solo archivo. Línea de 1,5 px con puntas cuadradas sobre una retícula de 24 × 24.
 * Solo usan currentColor: el color lo pone el CSS de quien los usa.
 */
export const ICONOS = {
  buscar: '<circle cx="10.5" cy="10.5" r="6.75"/><path d="M15.75 15.75 20.25 20.25"/>',
  carrito:
    '<path d="M2.25 4.5h3L7.5 15.75h11.25L21 7.5H6"/><rect x="7.5" y="18.75" width="2.25" height="2.25"/><rect x="15.75" y="18.75" width="2.25" height="2.25"/>',
  menu: '<path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/>',
  cerrar: '<path d="M5.25 5.25 18.75 18.75M18.75 5.25 5.25 18.75"/>',
  mas: '<path d="M12 4.5v15M4.5 12h15"/>',
  menos: '<path d="M4.5 12h15"/>',
  basura: '<path d="M4.5 6.75h15M9.75 6.75v-3h4.5v3M6.75 6.75l.75 13.5h9l.75-13.5M10.5 10.5v6M13.5 10.5v6"/>',
  'chevron-abajo': '<path d="M6 9.75 12 15.75 18 9.75"/>',
  'chevron-derecha': '<path d="M9.75 6 15.75 12 9.75 18"/>',
  'flecha-derecha': '<path d="M3.75 12h15M13.5 6.75 18.75 12 13.5 17.25"/>',
  check: '<path d="M4.5 12.75 9.75 18 19.5 6.75"/>',
  alerta: '<path d="M12 3.75 21.75 20.25H2.25z"/><path d="M12 9.75v4.5M12 16.5v1.5"/>',
  info: '<rect x="3.75" y="3.75" width="16.5" height="16.5"/><path d="M12 10.5v6M12 7.5v.75"/>',
  copiar: '<rect x="8.25" y="8.25" width="12" height="12"/><path d="M15.75 8.25v-4.5h-12v12h4.5"/>',
  mensaje: '<path d="M3.75 4.5h16.5v11.25H9l-5.25 4.5z"/><path d="M7.5 8.25h9M7.5 11.25h6"/>',
  correo: '<rect x="3" y="5.25" width="18" height="13.5"/><path d="M3 5.25 12 12.75 21 5.25"/>',
  movil: '<rect x="6.75" y="2.25" width="10.5" height="19.5"/><path d="M6.75 5.25h10.5M6.75 17.25h10.5M11.25 19.5h1.5"/>',
  ubicacion: '<path d="M12 21.75 5.25 12.75V3h13.5v9.75z"/><rect x="9.75" y="6" width="4.5" height="4.5"/>',
  reloj: '<circle cx="12" cy="12" r="8.25"/><path d="M12 7.5V12l3 2.25"/>',
  tienda: '<path d="M3.75 10.5v9.75h16.5V10.5M2.25 3.75h19.5l.75 6.75H1.5z"/><path d="M9.75 20.25v-5.25h4.5v5.25"/>',
  camion:
    '<path d="M2.25 5.25h11.25v10.5H2.25zM13.5 9h4.5l3.75 3.75v3H13.5"/><rect x="4.5" y="15.75" width="3" height="3"/><rect x="15.75" y="15.75" width="3" height="3"/>',
  caja: '<path d="M12 2.25 3 6.75v10.5l9 4.5 9-4.5V6.75z"/><path d="M3 6.75 12 11.25 21 6.75M12 11.25v10.5"/>',
  pallet:
    '<rect x="3.75" y="8.25" width="7.5" height="7.5"/><rect x="12.75" y="8.25" width="7.5" height="7.5"/><rect x="8.25" y="2.25" width="7.5" height="6"/><path d="M2.25 15.75h19.5M2.25 20.25h19.5M3.75 15.75v4.5M12 15.75v4.5M20.25 15.75v4.5"/>',
  contenedor:
    '<rect x="2.25" y="6.75" width="19.5" height="10.5"/><path d="M6 6.75v10.5M9.75 6.75v10.5M13.5 6.75v10.5M17.25 6.75v10.5"/>',
  equipo:
    '<rect x="3" y="8.25" width="18" height="10.5"/><path d="M6.75 8.25V4.5h6v3.75M6 18.75v2.25M18 18.75v2.25M14.25 12h3.75M14.25 15h3.75"/><rect x="6" y="11.25" width="4.5" height="4.5"/>',
  cuadricula:
    '<rect x="3.75" y="3.75" width="6.75" height="6.75"/><rect x="13.5" y="3.75" width="6.75" height="6.75"/><rect x="3.75" y="13.5" width="6.75" height="6.75"/><rect x="13.5" y="13.5" width="6.75" height="6.75"/>',
  energia: '<rect x="3.75" y="7.5" width="16.5" height="12.75"/><path d="M7.5 7.5v-3h9v3M12.75 10.5 10.5 14.25h3L11.25 18"/>',
  hogar: '<rect x="6" y="2.25" width="12" height="19.5"/><path d="M6 9h12M9 4.5v2.25M9 11.25V15"/>',
  herramientas:
    '<path d="M3 5.25h12v6H3zM15 6.75h3v3h-3M18 8.25h3.75M6.75 11.25l-1.5 6h6l.75-6"/><rect x="4.5" y="17.25" width="7.5" height="4.5"/>',
  auto: '<path d="M2.25 16.5V12l2.25-.75 2.25-4.5h10.5l2.25 4.5 2.25.75v4.5z"/><path d="M6 11.25h12"/><rect x="5.25" y="16.5" width="3" height="3"/><rect x="15.75" y="16.5" width="3" height="3"/>',
  oficina:
    '<path d="M6.75 9V3h10.5v6"/><rect x="3" y="9" width="18" height="8.25"/><path d="M6.75 14.25h10.5v6.75H6.75zM17.25 11.25h1.5"/>',
  bicicleta:
    '<circle cx="5.625" cy="15.75" r="3.75"/><circle cx="18.375" cy="15.75" r="3.75"/><path d="M5.625 15.75 9.375 9h6.75l2.25 6.75M9.375 9 12 15.75 16.125 9M12 15.75H5.625M7.875 6h3M15.375 6.375l.75 2.625"/>',
  externo: '<path d="M13.5 3.75h6.75v6.75M20.25 3.75l-9 9"/><path d="M17.25 13.5v6.75H3.75V6.75h6.75"/>',
  filtro:
    '<path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/><rect x="7.5" y="5.25" width="3" height="3" fill="currentColor"/><rect x="13.5" y="10.5" width="3" height="3" fill="currentColor"/><rect x="9" y="15.75" width="3" height="3" fill="currentColor"/>',
  pago: '<rect x="2.25" y="6" width="19.5" height="12"/><path d="M2.25 9.75h19.5M5.25 14.25h4.5"/>',
  editar: '<path d="M15.75 3.75 20.25 8.25 8.25 20.25H3.75v-4.5z"/><path d="M13.5 6 18 10.5"/>',
} as const;

export type NombreIcono = keyof typeof ICONOS;

export function esIcono(nombre: string): nombre is NombreIcono {
  return Object.hasOwn(ICONOS, nombre);
}

/** El SVG completo de un ícono, para usarlo desde los scripts del navegador. */
export function iconoSvg(nombre: NombreIcono, tamano = 20): string {
  return `<svg class="icono" width="${tamano}" height="${tamano}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false">${ICONOS[nombre]}</svg>`;
}
