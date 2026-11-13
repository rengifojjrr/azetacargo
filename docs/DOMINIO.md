# Cómo poner la tienda en azetacargo.com

Hoy la tienda vive en <https://rengifojjrr.github.io/azetacargo/>. Cuando Azeta dé acceso al DNS del dominio:

## 1. Registros DNS (en el proveedor del dominio)

| Tipo | Nombre | Valor |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `rengifojjrr.github.io` |

Opcional, para IPv6: cuatro registros `AAAA` en `@` con `2606:50c0:8000::153`, `2606:50c0:8001::153`,
`2606:50c0:8002::153` y `2606:50c0:8003::153`.

Antes, borra cualquier otro registro `A`, `AAAA` o `CNAME` de `@` y de `www` que apunte a otro lado (por ejemplo, la
página de estacionamiento del registrador). No toques los registros de correo (`MX`, `TXT` de SPF, etc.).

## 2. Recomendado: verificar el dominio en GitHub

Así nadie más puede usar `azetacargo.com` en GitHub Pages. En GitHub: foto de perfil › **Settings** › **Pages** ›
**Add a domain** › `azetacargo.com`. GitHub da un registro `TXT` para agregar en el DNS; luego se toca **Verify**.

## 3. Activar el dominio y cambiar una línea (hacerlo seguido)

1. Repositorio › **Settings** › **Pages** › **Custom domain** › `azetacargo.com` › **Save**.
   O desde la terminal:

   ```bash
   gh api -X PUT repos/rengifojjrr/azetacargo/pages -f cname=azetacargo.com
   ```

2. En `sitio.config.mjs` cambia la única variable y publica:

   ```js
   export const URL_SITIO = 'https://azetacargo.com';
   ```

   De ahí salen la dirección base de todos los enlaces, las canónicas, el `hreflang` y el mapa del sitio. Entre el
   paso 1 y el fin de esta publicación (unos 4 minutos) algunos enlaces pueden fallar; luego todo queda bien.

No hace falta el archivo `CNAME`: con publicación por GitHub Actions, el dominio se guarda en la configuración de
Pages.

## 4. HTTPS

Cuando el chequeo de DNS de **Settings › Pages** salga en verde (de minutos a 24 horas), marca **Enforce HTTPS**:

```bash
gh api -X PUT repos/rengifojjrr/azetacargo/pages -F https_enforced=true
```

## 5. Comprobar

- <https://azetacargo.com> y <https://www.azetacargo.com> abren la tienda (`www` redirige al dominio sin `www`).
- La dirección vieja (`rengifojjrr.github.io/azetacargo/`) redirige sola al dominio.
- <https://azetacargo.com/robots.txt> responde. Cuando ya haya WhatsApp configurado (ver `src/config/negocio.ts`), el
  sitio deja de llevar `noindex` y `robots.txt` anuncia `sitemap.xml`.
