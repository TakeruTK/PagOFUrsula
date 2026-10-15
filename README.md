# Ursula Alcaino · Orfebrería

Sitio de joyería de autora, en español e inglés, con un diseño editorial inspirado en casaorfebre.cl: portada oscura a pantalla completa, texto sobre el trabajo, piezas únicas con su material y botones de contacto. **No hay pasarela de pago**: las ventas se conversan por WhatsApp, Instagram o correo. Incluye SEO internacional y un taller privado para administrar piezas y textos.

> La versión anterior, con Mercado Pago, PayPal, carrito y pedidos, se conserva en la rama de git `feature/payments-i18n`.

## Ejecutar

Requiere Node 24 o superior (funciona en Node 22.17) y pnpm.

```sh
pnpm install --frozen-lockfile
pnpm admin:setup        # crea el usuario `ursula` y muestra su contraseña una sola vez
pnpm dev                # http://127.0.0.1:3002
```

Producción: `pnpm build && pnpm start` detrás de HTTPS y con disco persistente (SQLite y fotos en `data/` o en `DATA_DIR`). No sirve para despliegues sin disco (Vercel/Cloudflare Workers).

## Variables de entorno

Se leen de `.env.local` o del entorno del servidor.

| Variable | Para qué sirve |
| --- | --- |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` | Acceso al taller (los genera `pnpm admin:setup`). La contraseña se cambia desde el panel (Seguridad). |
| `SITE_URL` | Dirección pública con `https://`. Define enlaces canónicos, hreflang, sitemap e imágenes sociales. |
| `ALLOW_INDEXING` | `true` solo cuando la clienta apruebe el sitio y `SITE_URL` sea https. Mientras no, todo el sitio lleva `noindex` y `robots.txt` bloquea a los buscadores. |
| `DATA_DIR` | Carpeta persistente de la base de datos y las fotos. |

## Páginas del sitio

| Página | `/es` | `/en` |
| --- | --- | --- |
| Inicio (portada, destacadas, contacto) | `/es` | `/en` |
| Colección completa con filtro por categoría | `/es/coleccion` | `/en/collection` |
| Sobre mi trabajo | `/es/sobre-mi` | `/en/about` |
| Contacto (canales y cómo conseguir una pieza) | `/es/contacto` | `/en/contact` |
| Cada pieza | `/es/joyas/<pieza>` | `/en/jewelry/<pieza>` |
| Condiciones y privacidad | `/es/terminos`, `/es/privacidad` | `/en/terms`, `/en/privacy` |

Todas tienen título, descripción, `canonical`, `hreflang` y entrada en el sitemap; colección, sobre mí y contacto incluyen datos estructurados (`CollectionPage`, `AboutPage`, `ContactPage`).

## Cómo se vende

Cada pieza lleva un botón **Consultar por WhatsApp** que abre la conversación con un mensaje listo (nombre de la pieza y enlace). También hay correo e Instagram. El número, el correo y el interruptor para mostrar o esconder los valores se configuran en el panel, en **Mi página**.

## SEO internacional

- Rutas por idioma: `/es` y `/en`; `/` redirige según el idioma del navegador.
- Direcciones traducidas en cada idioma (ver tabla de páginas).
- `canonical`, `hreflang` (es, en, x-default), Open Graph y Twitter por página; imagen social generada.
- JSON-LD: Organization, WebSite, Product y BreadcrumbList (el precio solo se publica si la clienta decide mostrarlo).
- `sitemap.xml` con ambas versiones de idioma y `robots.txt` dinámico.
- El panel permite nombre, descripción, materiales y descripción de foto en inglés por pieza.

Antes de abrir al público: define `SITE_URL` (https), sube fotografías reales, completa el WhatsApp y recién entonces pon `ALLOW_INDEXING=true`. El panel (*Resumen*) muestra qué falta.

## Taller

`/admin`: resumen con lista de lanzamiento; piezas (fotos, slug, inglés, duplicar, borrador/publicado, orden, portada); textos de la página en español e inglés; contacto; condiciones y privacidad; cambio de contraseña.

## Validación

```sh
pnpm typecheck
pnpm build
pnpm test
```

Las pruebas arrancan la compilación de producción con bases aisladas y cubren: ausencia de rutas de pago, seguridad del panel, catálogo y borradores, contacto por WhatsApp/correo, precios ocultos por defecto, negociación de idioma, hreflang/canonical/JSON-LD, indexación en revisión vs. producción y cambio de contraseña.

## Pendiente de la clienta

Fotografías originales y datos reales de cada pieza (materiales, medidas); número de WhatsApp y correo; revisión de condiciones y privacidad (son borradores); dominio `.com`; textos finales de la portada.
