# Úrsula Alcaíno · Orfebrería

Tienda en línea de joyería de autor, en español e inglés, con pagos por **Mercado Pago** (pesos chilenos) y **PayPal** (dólares), SEO internacional y un taller privado para administrar piezas, pedidos, envíos y textos.

## Ejecutar

Requiere Node 24 o superior (funciona en Node 22.17) y pnpm.

```sh
pnpm install --frozen-lockfile
pnpm admin:setup        # crea el usuario `ursula` y muestra su contraseña una sola vez
pnpm dev                # http://127.0.0.1:3002
```

Producción: `pnpm build && pnpm start` detrás de HTTPS y con disco persistente (SQLite + fotos en `data/` o en `DATA_DIR`). No sirve para despliegues sin disco (Vercel/Cloudflare Workers).

## Variables de entorno

Se leen del archivo `.env.local` o del entorno del servidor. Ninguna secreta llega al navegador ni se guarda en el panel.

| Variable | Para qué sirve |
| --- | --- |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` | Acceso al taller (los genera `pnpm admin:setup`). La contraseña se puede cambiar desde el panel (Seguridad). |
| `SITE_URL` | Dirección pública con `https://`. Define enlaces canónicos, hreflang, sitemap y retornos de pago. |
| `ALLOW_INDEXING` | `true` solo cuando la clienta apruebe la tienda y `SITE_URL` sea https. Mientras no, todo el sitio lleva `noindex` y `robots.txt` bloquea a los buscadores. |
| `DATA_DIR` | Carpeta persistente de la base de datos y las fotos. |
| `PAYMENT_MODE` | `demo` = simulador sin cobros (para revisión). `live` = pagos reales. |
| `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` | Mercado Pago. |
| `PAYPAL_ENV` (`sandbox`/`live`), `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID` | PayPal. |
| `RESEND_API_KEY`, `MAIL_FROM` | Correos de confirmación y despacho (opcional). |

## Activar los pagos

1. **Mercado Pago** (cuenta de Chile): crea una aplicación en *Mercado Pago Developers*, copia el *Access Token* a `MP_ACCESS_TOKEN`. En *Webhooks* registra `https://TU-DOMINIO/api/webhooks/mercadopago` para el evento *Pagos* y copia la clave secreta a `MP_WEBHOOK_SECRET`. Se ofrece solo para envíos a Chile.
2. **PayPal**: crea una app en *developer.paypal.com* (primero `sandbox`), copia `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`. Registra `https://TU-DOMINIO/api/webhooks/paypal` con los eventos `PAYMENT.CAPTURE.COMPLETED`, `DENIED` y `REFUNDED` y copia el *Webhook ID* a `PAYPAL_WEBHOOK_ID`. Se ofrece en todos los países y cobra en USD.
3. Pon `PAYMENT_MODE=live`, reinicia el servidor y haz una compra de prueba con las credenciales *sandbox*/de prueba antes de pasar a producción.

Cómo funciona (seguridad):

- El servidor calcula precios, envío y total desde su propio catálogo; ignora lo que envíe el navegador.
- Un pedido reserva su stock 45 minutos; el stock se descuenta recién cuando el pago se **confirma**.
- Mercado Pago: se crea la preferencia en el servidor; el webhook (firma `x-signature` verificada) solo avisa, y el pago se **vuelve a consultar** a la API de Mercado Pago comparando pedido, monto y moneda. Si el comprador vuelve antes del webhook, la página del pedido consulta a Mercado Pago directamente.
- PayPal: la orden se crea en el servidor; al volver, el servidor captura y verifica monto y moneda. El webhook se verifica con la API de PayPal y la captura se vuelve a consultar.
- Cada confirmación es idempotente: repetir un aviso no descuenta stock dos veces.

## Moneda y envíos

Los precios base están en CLP. PayPal cobra en USD usando el tipo de cambio de *Envíos y precios* (CLP por 1 USD). Los costos y plazos de envío se definen por zona (Chile, Latinoamérica, resto del mundo) y se calculan según el país elegido.

## SEO internacional

- Rutas por idioma: `/es` y `/en`; `/` redirige según el idioma del navegador.
- Direcciones traducidas: `/es/joyas/<pieza>` ↔ `/en/jewelry/<pieza>`, `/es/terminos` ↔ `/en/terms`, etc.
- `canonical`, `hreflang` (es, en, x-default), Open Graph y Twitter por página; imagen social generada.
- Datos estructurados JSON-LD: Organization, WebSite, Product (+ Offer en CLP o USD) y BreadcrumbList.
- `sitemap.xml` con todas las versiones de idioma y `robots.txt` dinámico.
- Cada pieza tiene página propia indexable; el panel permite nombre, descripción, materiales y descripción de foto en inglés.

Antes de abrir al público: define `SITE_URL` (https), sube fotografías reales, revisa envíos y políticas, y recién entonces pon `ALLOW_INDEXING=true`. El panel (*Resumen* y *Pagos y lanzamiento*) muestra qué falta.

## Taller (panel)

`/admin`: resumen y lista de lanzamiento; piezas (fotos, slug, inglés, duplicar, stock); pedidos (estados, despacho con seguimiento, reembolso, exportar CSV); textos en español e inglés; envíos y tipo de cambio; políticas; estado de pagos y webhooks; cambio de contraseña.

## Validación

```sh
pnpm typecheck
pnpm build
pnpm test
```

Las pruebas arrancan la compilación de producción con bases aisladas y APIs falsas de Mercado Pago y PayPal. Cubren seguridad del panel, catálogo, ambos flujos de pago (firmas, montos, idempotencia, stock), reservas, reglas de envío, gestión de pedidos, negociación de idioma, hreflang/canonical/JSON-LD, indexación en revisión vs. producción, simulador y cambio de contraseña.

## Pendiente de la clienta

Fotografías originales y catálogo real; costos de envío; revisión legal de las políticas (son borradores); dominio `.com`; credenciales de Mercado Pago y PayPal; correo de pedidos.
