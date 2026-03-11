# SIMI → BD cache (aceleración de propiedades)

## Qué se implementó

- Persistencia de propiedades SIMI en Postgres (`simi_properties`) con payload canónico.
- Lectura prioritaria desde BD en `getProperties()` para responder más rápido a la web.
- Fallback automático a caché Redis/memoria + SIMI API cuando la BD no tiene datos.
- Upsert automático a BD después de traer datos de SIMI (warm-up progresivo).
- Endpoint manual/on-demand de sincronización:
  - `POST /api/sync/simi`
  - Token opcional vía header `x-sync-token` (env `SIMI_SYNC_TOKEN`).
- Tabla de estado de sincronización (`simi_sync_state`).

## Flujo operativo

1. Front/API solicita propiedades (`/api/propiedades` o páginas SSR).
2. `getProperties()` intenta BD primero.
3. Si hay datos en BD, responde de inmediato (fuente acelerada).
4. Si no hay, usa flujo actual SIMI + caché en servidor.
5. Al obtener desde SIMI, hace upsert en BD para acelerar siguientes llamadas.

## Sincronización

### Manual / On-demand

```bash
curl -X POST "https://TU-DOMINIO/api/sync/simi" \
  -H "x-sync-token: $SIMI_SYNC_TOKEN"
```

Sin filtros (full fetch lógico con límites actuales del cliente SIMI).

Con filtros (incremental por segmento, útil para cron por ciudad):

```bash
curl -X POST "https://TU-DOMINIO/api/sync/simi?city=Pereira&operation=venta" \
  -H "x-sync-token: $SIMI_SYNC_TOKEN"
```

### Cron recomendado

Ejemplo cada 15 minutos:

```bash
*/15 * * * * curl -s -X POST "https://TU-DOMINIO/api/sync/simi" -H "x-sync-token: $SIMI_SYNC_TOKEN" >/dev/null
```

## Variables de entorno

- `DATABASE_URL` (requerido para usar BD)
- `SIMI_API_KEY` / `SIMI_API_URL`
- `SIMI_DB_CACHE_ENABLED` (default `true`)
- `SIMI_SYNC_TOKEN` (opcional, recomendado)

## Validación rápida

1. Ejecutar migración `0001_simi_properties_cache.sql`.
2. Correr sync manual (`POST /api/sync/simi`).
3. Consultar `/api/propiedades?...` y confirmar logs:
   - `[SIMI][DB] cache hit: ...`
4. Verificar contenido en tabla `simi_properties`.

## Notas de consistencia

- Estrategia pragmática: upsert por ID SIMI + `last_synced_at`.
- Sin endpoint oficial de delta por fecha en SIMI, por lo que la actualización incremental viable se plantea por segmentación (ciudad/operación/tipo) vía sync on-demand/cron.
- En caso de caída de BD, el sistema mantiene fallback al flujo actual (SIMI/Redis/memoria).
