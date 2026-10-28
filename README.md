# Ursula Alcaino · Orfebrería

Sitio de joyería de autora, en cuatro idiomas (español, inglés, portugués y francés), con un diseño editorial inspirado en casaorfebre.cl: portada oscura a pantalla completa, texto sobre el trabajo, piezas únicas con su material y botones de contacto. **No hay pasarela de pago**: las ventas se conversan por WhatsApp, Instagram o correo. Incluye SEO internacional y un taller privado para administrar piezas y textos.

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

| Página | `/es` | `/en` | `/pt` | `/fr` |
| --- | --- | --- | --- | --- |
| Inicio | `/es` | `/en` | `/pt` | `/fr` |
| Colección | `/es/coleccion` | `/en/collection` | `/pt/colecao` | `/fr/collection` |
| Sobre mi trabajo | `/es/sobre-mi` | `/en/about` | `/pt/sobre` | `/fr/a-propos` |
| Contacto | `/es/contacto` | `/en/contact` | `/pt/contato` | `/fr/contact` |
| Cada pieza | `/es/joyas/<pieza>` | `/en/jewelry/<pieza>` | `/pt/joias/<pieza>` | `/fr/bijoux/<pieza>` |
| Condiciones y privacidad | `/es/terminos`, `/es/privacidad` | `/en/terms`, `/en/privacy` | `/pt/termos`, `/pt/privacidade` | `/fr/conditions`, `/fr/confidentialite` |

Todas tienen título, descripción, `canonical`, `hreflang` y entrada en el sitemap; colección, sobre mí y contacto incluyen datos estructurados (`CollectionPage`, `AboutPage`, `ContactPage`).

## Cómo se vende

Cada pieza lleva un botón **Consultar por WhatsApp** que abre la conversación con un mensaje listo (nombre de la pieza y enlace). También hay correo e Instagram. El número, el correo y el interruptor para mostrar o esconder los valores se configuran en el panel, en **Mi página**.

## SEO internacional

- Rutas por idioma: `/es` (Latinoamérica y España), `/en` (Europa y el mundo), `/pt` (Brasil y Portugal) y `/fr` (Francia, Bélgica y Suiza); `/` redirige según el idioma del navegador (si no está traducido, a inglés).
- Direcciones traducidas en cada idioma (ver tabla de páginas).
- `canonical`, `hreflang` (es, en, pt, fr, x-default; solo los idiomas en que la página existe de verdad), Open Graph y Twitter por página; imagen social generada.
- JSON-LD: Organization, WebSite, Product y BreadcrumbList (el precio solo se publica si la clienta decide mostrarlo).
- `sitemap.xml` con las versiones de idioma de cada página (y fotos para Google Imágenes) y `robots.txt` dinámico.
- Las categorías del filtro (aros, anillos, pulseras…) las crea y traduce la clienta en Mis piezas → Categorías.
- El panel permite escribir nombre, descripción, materiales, tamaño y descripción de foto en cada idioma. Una pieza sin traducir no se lista en ese idioma y su página va con `noindex`, para no duplicar el texto en español.
- Verificación de buscadores: `GOOGLE_SITE_VERIFICATION` y `BING_SITE_VERIFICATION` (códigos de Search Console y Bing Webmaster).
- La clienta escribe solo en español: al guardar, las piezas, los textos de la página y las categorías se traducen solos a inglés, portugués y francés (con `DEEPL_API_KEY` o `GOOGLE_TRANSLATE_API_KEY`, ambos con 500.000 caracteres gratis al mes, usa ese servicio; con `ANTHROPIC_API_KEY`, Claude; sin ninguna, el traductor público de Google, que puede bloquearse). Lo que ella corrige a mano no se vuelve a sobrescribir.

Antes de abrir al público: define `SITE_URL` (https), sube fotografías reales, completa el WhatsApp y recién entonces pon `ALLOW_INDEXING=true`. El panel (*Resumen*) muestra qué falta.

## Taller

`/admin`: resumen con lista de lanzamiento; piezas (fotos, slug, idiomas, duplicar, borrador/publicado, orden, portada); textos de la página en los cuatro idiomas; contacto; condiciones y privacidad; cambio de contraseña.

## Puesta en producción

1. **Servidor con disco persistente** y Node 24: la base (`ursula.sqlite`) guarda piezas, textos y fotos. No sirve un hosting sin disco (tipo funciones serverless) porque las fotos y los cambios de la clienta se perderían.
2. **Contenido real**: `pnpm db:production` crea `data/production/ursula.sqlite` (solo piezas publicadas, sin sesiones ni contraseñas). Súbelo a la carpeta que uses como `DATA_DIR`. Si el servidor arranca sin esa base, mostrará las piezas de ejemplo.
3. **Variables de entorno**: `SITE_URL=https://ursulaalcainoorfebreria.com`, `DATA_DIR`, `ALLOW_INDEXING=true` (solo cuando la clienta apruebe), `TRUST_PROXY=true` si hay un proxy/CDN delante (límite de intentos de login por visitante), `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`, `DEEPL_API_KEY` o `GOOGLE_TRANSLATE_API_KEY` (traducción automática confiable, gratis hasta 500.000 caracteres al mes).
4. **Acceso al taller**: en el servidor, `pnpm admin:setup` y guardar la contraseña que muestra.
5. **Arranque**: `pnpm build && pnpm start -- --hostname 0.0.0.0` detrás de HTTPS.
6. **Respaldo**: el sitio guarda solo una copia diaria (las últimas 7) en `DATA_DIR/backups`. Copia esa carpeta a otro lugar con regularidad: si se pierde el disco, se pierden también los respaldos.
7. **Fotos**: se reducen solas en el navegador (máximo 1800 px, WebP) y el servidor las limita a 2 MB cada una, 6 por pieza, 6 en la portada y 150 MB en total (`PHOTO_STORAGE_MB` lo cambia). Las fotos sin uso se borran solas después de un día.

## Validación

```sh
pnpm typecheck
pnpm build
pnpm test
```

Las pruebas arrancan la compilación de producción con bases aisladas y cubren: ausencia de rutas de pago, seguridad del panel, catálogo y borradores, contacto por WhatsApp/correo, precios ocultos por defecto, negociación de idioma, hreflang/canonical/JSON-LD, indexación en revisión vs. producción y cambio de contraseña.

## Pendiente de la clienta

Fotografías originales y datos reales de cada pieza (materiales, medidas); número de WhatsApp y correo; revisión de condiciones y privacidad (son borradores); dominio `.com`; textos finales de la portada.
