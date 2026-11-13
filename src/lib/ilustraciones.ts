/**
 * Dibujos de línea (4:3) que reemplazan la foto mientras un producto no la tenga.
 * Uno por categoría, en trazo de 1,5 px con puntas cuadradas. Los colores llegan como parámetro
 * (salen de tokens.css), así que aquí no hay ningún color escrito.
 */

export interface ColoresIlustracion {
  trazo: string;
  detalle: string;
  suelo: string;
  fondo: string;
}

const suelo = '<line class="s" x1="36" y1="250" x2="364" y2="250"/>';

const DIBUJOS: Record<string, string> = {
  electronica: `
    <rect x="150" y="116" width="196" height="134" class="f"/>
    <rect x="160" y="126" width="176" height="114" class="d"/>
    <line x1="246" y1="121" x2="250" y2="121" class="d"/>
    <rect x="70" y="76" width="96" height="174" class="f"/>
    <rect x="78" y="92" width="80" height="140" class="d"/>
    <line x1="104" y1="84" x2="126" y2="84"/>
    <rect x="134" y="82" width="4" height="4"/>
    <line x1="108" y1="241" x2="128" y2="241"/>
    <line x1="88" y1="104" x2="118" y2="104" class="d"/>
    <line x1="88" y1="112" x2="140" y2="112" class="d"/>
    <rect x="88" y="124" width="60" height="44" class="d"/>`,
  energia: `
    <rect x="110" y="112" width="180" height="134"/>
    <rect x="124" y="246" width="20" height="4"/>
    <rect x="256" y="246" width="20" height="4"/>
    <line x1="110" y1="130" x2="290" y2="130"/>
    <polyline points="138,112 138,82 262,82 262,112"/>
    <polyline points="152,112 152,96 248,96 248,112"/>
    <rect x="128" y="146" width="70" height="42"/>
    <rect x="138" y="156" width="8" height="22" class="d"/>
    <rect x="152" y="156" width="8" height="22" class="d"/>
    <rect x="166" y="156" width="8" height="22" class="d"/>
    <rect x="180" y="156" width="8" height="22" class="d"/>
    <rect x="214" y="146" width="28" height="30"/>
    <rect x="250" y="146" width="28" height="30"/>
    <line x1="224" y1="154" x2="224" y2="163" class="d"/>
    <line x1="232" y1="154" x2="232" y2="163" class="d"/>
    <line x1="260" y1="154" x2="260" y2="163" class="d"/>
    <line x1="268" y1="154" x2="268" y2="163" class="d"/>
    <rect x="226" y="167" width="4" height="4" class="d"/>
    <rect x="262" y="167" width="4" height="4" class="d"/>
    <rect x="128" y="206" width="16" height="8" class="d"/>
    <rect x="152" y="206" width="16" height="8" class="d"/>
    <rect x="176" y="206" width="16" height="8" class="d"/>
    <rect x="200" y="206" width="16" height="8" class="d"/>
    <rect x="246" y="198" width="32" height="24"/>
    <polyline points="265,203 258,211 265,211 258,219"/>`,
  hogar: `
    <rect x="64" y="40" width="124" height="206"/>
    <rect x="72" y="246" width="14" height="4"/>
    <rect x="166" y="246" width="14" height="4"/>
    <line x1="64" y1="110" x2="188" y2="110"/>
    <rect x="170" y="58" width="4" height="36"/>
    <rect x="170" y="124" width="4" height="60"/>
    <line x1="80" y1="228" x2="104" y2="228" class="d"/>
    <rect x="206" y="166" width="162" height="6"/>
    <rect x="212" y="172" width="150" height="78"/>
    <line x1="287" y1="180" x2="287" y2="242" class="d"/>
    <line x1="279" y1="200" x2="279" y2="214" class="d"/>
    <line x1="295" y1="200" x2="295" y2="214" class="d"/>
    <rect x="222" y="96" width="130" height="70"/>
    <rect x="232" y="106" width="78" height="50"/>
    <line x1="318" y1="100" x2="318" y2="162" class="d"/>
    <rect x="326" y="110" width="8" height="5" class="d"/>
    <rect x="338" y="110" width="8" height="5" class="d"/>
    <rect x="326" y="121" width="8" height="5" class="d"/>
    <rect x="338" y="121" width="8" height="5" class="d"/>
    <rect x="326" y="132" width="8" height="5" class="d"/>
    <rect x="338" y="132" width="8" height="5" class="d"/>
    <rect x="326" y="146" width="20" height="8"/>`,
  herramientas: `
    <rect x="118" y="214" width="112" height="36"/>
    <line x1="130" y1="226" x2="150" y2="226" class="d"/>
    <rect x="190" y="224" width="6" height="4" class="d"/>
    <rect x="200" y="224" width="6" height="4" class="d"/>
    <rect x="210" y="224" width="6" height="4" class="d"/>
    <polygon points="150,214 160,148 206,148 202,214"/>
    <line x1="170" y1="168" x2="166" y2="200" class="d"/>
    <line x1="180" y1="168" x2="176" y2="200" class="d"/>
    <polygon points="116,92 254,92 262,100 262,140 254,148 116,148"/>
    <line x1="134" y1="92" x2="134" y2="148" class="d"/>
    <line x1="124" y1="104" x2="124" y2="136" class="d"/>
    <rect x="262" y="102" width="14" height="36"/>
    <line x1="269" y1="102" x2="269" y2="138" class="d"/>
    <polygon points="276,106 304,110 304,130 276,134"/>
    <line x1="290" y1="108" x2="290" y2="132" class="d"/>
    <polyline points="304,117 348,117 358,120 348,123 304,123"/>
    <polygon points="206,154 216,154 213,176 204,174"/>`,
  auto: `
    <rect x="170" y="120" width="140" height="126"/>
    <rect x="182" y="246" width="16" height="4"/>
    <rect x="282" y="246" width="16" height="4"/>
    <rect x="186" y="112" width="34" height="8"/>
    <rect x="186" y="140" width="56" height="30"/>
    <rect x="194" y="150" width="22" height="10" class="d"/>
    <rect x="216" y="153" width="3" height="4" class="d"/>
    <rect x="256" y="142" width="12" height="8" class="d"/>
    <rect x="276" y="142" width="12" height="8" class="d"/>
    <rect x="256" y="160" width="32" height="14"/>
    <rect x="186" y="190" width="20" height="20"/>
    <line x1="170" y1="226" x2="310" y2="226" class="d"/>
    <polyline points="170,196 156,196 140,180 112,180"/>
    <polygon points="98,175 58,163 58,169 98,179"/>
    <polygon points="98,181 58,193 58,187 98,179"/>
    <rect x="98" y="172" width="14" height="16"/>
    <polyline points="170,206 156,206 140,222 112,222"/>
    <polygon points="98,217 58,205 58,211 98,221"/>
    <polygon points="98,223 58,235 58,229 98,221"/>
    <rect x="98" y="214" width="14" height="16"/>`,
  oficina: `
    <polygon points="136,128 148,64 252,64 264,128" class="f"/>
    <line x1="166" y1="82" x2="234" y2="82" class="d"/>
    <line x1="164" y1="94" x2="222" y2="94" class="d"/>
    <line x1="162" y1="106" x2="236" y2="106" class="d"/>
    <rect x="100" y="128" width="200" height="22"/>
    <rect x="88" y="150" width="224" height="96"/>
    <rect x="100" y="246" width="20" height="4"/>
    <rect x="280" y="246" width="20" height="4"/>
    <line x1="112" y1="190" x2="288" y2="190"/>
    <rect x="140" y="190" width="120" height="34" class="d"/>
    <line x1="156" y1="202" x2="230" y2="202" class="d"/>
    <line x1="156" y1="212" x2="214" y2="212" class="d"/>
    <rect x="264" y="160" width="36" height="20"/>
    <rect x="270" y="166" width="6" height="6" class="d"/>
    <rect x="282" y="166" width="6" height="6" class="d"/>
    <rect x="104" y="164" width="6" height="6" class="d"/>`,
  bicicletas: `
    <circle cx="118" cy="196" r="54"/>
    <circle cx="118" cy="196" r="46" class="d"/>
    <circle cx="290" cy="196" r="54"/>
    <circle cx="290" cy="196" r="46" class="d"/>
    <rect x="116" y="194" width="4" height="4"/>
    <rect x="288" y="194" width="4" height="4"/>
    <polyline points="118,196 196,204 180,122"/>
    <polyline points="118,196 180,128 262,124"/>
    <line x1="196" y1="204" x2="268" y2="140"/>
    <line x1="262" y1="116" x2="270" y2="146"/>
    <line x1="270" y1="146" x2="290" y2="196"/>
    <line x1="180" y1="122" x2="176" y2="104"/>
    <rect x="156" y="98" width="40" height="6"/>
    <polyline points="262,116 258,102 272,100 282,108"/>
    <circle cx="196" cy="204" r="12"/>
    <line x1="196" y1="204" x2="208" y2="226"/>
    <rect x="202" y="226" width="16" height="4"/>
    <line x1="196" y1="192" x2="118" y2="190" class="d"/>
    <line x1="196" y1="216" x2="118" y2="202" class="d"/>`,
};

const GENERICO = `
    <polygon points="200,90 290,130 290,220 200,250 110,220 110,130"/>
    <polyline points="110,130 200,170 290,130"/>
    <line x1="200" y1="170" x2="200" y2="250"/>`;

export function svgIlustracion(categoria: string, c: ColoresIlustracion): string {
  const dibujo = DIBUJOS[categoria] ?? GENERICO;
  const estilo = `*{vector-effect:non-scaling-stroke}g{fill:none;stroke:${c.trazo};stroke-width:1.5;stroke-linecap:square;stroke-linejoin:miter}.d{stroke:${c.detalle}}.s{stroke:${c.suelo}}.f{fill:${c.fondo}}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><style>${estilo}</style><g>${suelo}${dibujo}</g></svg>`;
}

export const CATEGORIAS_ILUSTRADAS = Object.keys(DIBUJOS);
