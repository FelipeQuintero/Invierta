# Portal Invierta Inmobiliaria

Portal web de Invierta Inmobiliaria: listado de propiedades en venta y arriendo, proyectos sobre planos, páginas de servicios y formularios de contacto que alimentan el CRM.

Producción: **https://www.invierta.com.co**

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Astro 5 (SSR con adaptador Node) |
| Islas interactivas | React 19 |
| Estilos | Tailwind CSS 4 |
| Base de datos | PostgreSQL 17 + Drizzle ORM |
| Caché | Redis |
| Mapas | Leaflet + OpenStreetMap |
| Street View | Google Maps Embed API |
| Hosting | Railway |

## Cómo funciona

1. **Inventario:** las propiedades vienen de la API de SIMI, que es de solo lectura. Al arrancar el servidor se hace una sincronización completa hacia PostgreSQL y luego se repite cada 24 horas. Las consultas del sitio se resuelven contra PostgreSQL, con Redis como caché de segundo nivel, así que la web no depende de la latencia de SIMI.
2. **Proyectos sobre planos:** se cargan a mano desde el panel `/admin/projects`, protegido por token.
3. **Formularios:** cada formulario envía un `solicitud_type`. La API `/api/webhook/lead-intake` guarda el lead en PostgreSQL y lo reenvía al webhook de GoHighLevel que corresponde a ese tipo. Si un tipo no tiene webhook configurado, el lead igual queda guardado y se registra el evento `ghl_forward_skipped`.

## Desarrollo local

```bash
npm install
cp .env.example .env    # completar los valores
npm run dev             # http://localhost:4321
```

Otros comandos:

```bash
npm run build      # build de producción
npm run start      # servir el build (node ./dist/server/entry.mjs)
npx astro check    # verificar tipos
```

## Variables de entorno

Están documentadas en [`.env.example`](./.env.example). Las imprescindibles:

| Variable | Para qué sirve |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `REDIS_URL` | Conexión a Redis (caché) |
| `SIMI_API_URL`, `SIMI_API_KEY`, `SIMI_INMOBILIARIA_ID` | Acceso a la API de SIMI |
| `SIMI_SYNC_TOKEN` | Protege el endpoint de sincronización manual |
| `ADMIN_TOKEN` | Acceso al panel `/admin` |
| `GHL_WEBHOOK_*` | Un webhook de GoHighLevel por tipo de solicitud |
| `PUBLIC_GOOGLE_MAPS_API_KEY` | Street View en el detalle de propiedad |
| `WHATSAPP_NUMBER`, `SITE_URL`, `SITE_NAME` | Datos del sitio |

Las variables con prefijo `PUBLIC_` quedan incluidas en el HTML que ve el navegador, así que deben estar restringidas por dominio en su proveedor.

## Base de datos

Las migraciones están en [`drizzle/`](./drizzle) y el esquema en [`src/db/schema.ts`](./src/db/schema.ts).

```bash
npx drizzle-kit generate   # generar una migración nueva
npx drizzle-kit migrate    # aplicarla
```

Tablas principales: `contacts` y `lead_cases` (leads del sitio), `simi_properties` (caché del inventario), `projects` y `project_typologies` (proyectos cargados a mano), `audit_events` (trazabilidad).

## Estructura

```
src/
├── components/     # Componentes Astro y React
├── db/             # Esquema y conexión Drizzle
├── layouts/        # Layout base
├── lib/            # Cliente SIMI, caché, utilidades, configuración del sitio
├── pages/          # Páginas y rutas de API
└── styles/         # Estilos globales
content/servicios/  # Contenido de las páginas de servicios (Markdown)
drizzle/            # Migraciones SQL
public/             # Imágenes y estáticos
```

La configuración del sitio (nombre, teléfono, redes, correo) está centralizada en [`src/lib/constants.ts`](./src/lib/constants.ts).

## Despliegue

Railway despliega automáticamente cada push a `main`. El build es `npm run build` y el arranque `npm run start`; Railway asigna el puerto por la variable `PORT`.

## Documentación adicional

- [`SIMI_API_DOCUMENTACION.md`](./SIMI_API_DOCUMENTACION.md) — endpoints y formato de respuesta de la API de SIMI.
- [`docs/simi-db-cache.md`](./docs/simi-db-cache.md) — diseño de la caché de propiedades.
