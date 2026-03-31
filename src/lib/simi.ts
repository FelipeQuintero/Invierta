import type { Property, PropertyFilters, Agent, PropertyType, OperationType, PropertyTag } from './types';
import { getMockProperties, getMockPropertyById } from './mockData';
import { readCacheEntry, writeCache } from './serverCache';
import {
  deactivateMissingPropertiesFromSync,
  getPropertiesFromDb,
  updateSyncState,
  upsertPropertiesToDb,
} from './simiDbCache';

const SIMI_API_URL = import.meta.env.SIMI_API_URL || 'http://simi-api.com/ApiSimiweb/response';
const SIMI_API_KEY = import.meta.env.SIMI_API_KEY;

const useMock = !SIMI_API_KEY;

// ============================================================================
// SIMI API Response Types (Real structure from API)
// ============================================================================

interface SimiFilterResponse {
  Inmuebles: SimiInmueble[];
  datosGrales: {
    inicio: number;
    fin: number;
    pagina_actual: string;
    totalInmuebles: number;
    totalPagina: number;
  };
}

// Response from individual property endpoint (/v2/inmueble/codInmueble/:id)
interface SimiInmuebleDetalle {
  idInm: string;
  codinm: string;
  IdInmobiliaria: string;
  IdGestion: string;
  IdTpInm: string;
  banos: string;
  alcobas: string;
  garaje: string;
  ValorVenta: string;
  ValorCanon: string;
  AreaConstruida: string;
  AreaLote: string;
  descripcionlarga: string;
  latitud: string;
  longitud: string;
  Estrato: string;
  Tipo_Inmueble: string;
  ciudad: string;
  barrio: string;
  zona: string;
  Gestion: string;
  fotos?: Array<{ foto: string; posi: string }>;
  video?: string | null;
  video360?: string | null;
}

interface SimiInmueble {
  Codigo_Inmueble: string;
  IdInmobiliaria: string;
  Tipo_Inmueble: string;
  idTipoInmueble: string;
  Gestion: string;
  idGestion: string;
  estadoInmueble: string;
  
  // Prices (come as formatted strings like "1,900,000,000")
  Venta: string;
  Canon: string;
  Administracion: string;
  
  // Location
  Departamento: string;
  Ciudad: string;
  Zona: string;
  Barrio: string;
  latitud: string;
  longitud: string;
  
  // Characteristics
  Estrato: string;
  AreaConstruida: string;
  AreaLote: string;
  Alcobas: string;
  banios: string;
  garaje: string;
  
  // Description
  descripcionlarga: string;
  
  // Media
  foto1: string;
  foto2?: string;
  foto3?: string;
  foto4?: string;
  foto5?: string;
  foto6?: string;
  foto7?: string;
  foto8?: string;
  foto9?: string;
  foto10?: string;
  foto360: number;
  video?: string | null;
  video360: string | null;
  
  // Metadata
  fingreso: string;
  destacado: string | null;
  
  // Other
  codInterno: string;
}

interface SimiDepartamento {
  id: string;
  nombre: string;
}

interface SimiCiudad {
  id: string;
  nombre: string;
}

interface SimiTipoInmueble {
  id: string;
  nombre: string;
}

interface SimiZona {
  id: string;
  nomZona: string;
}

interface SimiBarrio {
  id: string;
  nombre: string;
}

interface SimiZonasResponse {
  zonas: Array<{ id: string; nomZona: string }>;
  response: number;
}

interface SimiBarriosResponse {
  barrios: SimiBarrio[];
  response: number;
}

// ============================================================================
// API Client
// ============================================================================

function getAuthHeader(): string {
  const credentials = `Authorization:${SIMI_API_KEY}`;
  const base64 = typeof btoa !== 'undefined' 
    ? btoa(credentials)
    : Buffer.from(credentials).toString('base64');
  return `Basic ${base64}`;
}

async function simiRequest<T>(endpoint: string): Promise<T> {
  const url = `${SIMI_API_URL}${endpoint}`;
  
  console.log('[SIMI] Requesting:', url);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`SIMI API Error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  return data as T;
}

// ============================================================================
// Type Mappings
// ============================================================================

const OPERATION_MAP: Record<OperationType, number> = {
  arriendo: 1,
  venta: 5,
  proyecto: 5,
};

const PROPERTY_TYPE_MAP: Record<string, PropertyType> = {
  'apartamento': 'apartamento',
  'apartaestudio': 'apartaestudio',
  'casa': 'casa',
  'casas': 'casa',
  'casa residencial': 'casa',    // SIMI ID 22 → agrupado bajo 'casa'
  'casa campestre': 'casa_campestre',
  'casas campestres': 'casa_campestre',
  'casa comercial': 'casa_comercial',
  'casa lote': 'casa_lote',
  'local': 'local',
  'locales': 'local',
  'oficina': 'oficina',
  'oficinas': 'oficina',
  'consultorio': 'consultorio',
  'consultorios': 'consultorio',
  'bodega': 'bodega',
  'bodegas': 'bodega',
  'edificio': 'edificio',
  'edificios': 'edificio',
  'finca': 'finca',
  'fincas': 'finca',
  'hotel': 'hotel',
  'hoteles': 'hotel',
  'lote': 'lote',
  'lotes': 'lote',
  'parqueadero': 'parqueadero',
  'parqueaderos': 'parqueadero',
};

const PROPERTY_TYPE_ID_MAP: Record<PropertyType, number[]> = {
  apartamento: [1],
  apartaestudio: [11],
  casa: [2, 22],         // 2=Casa, 22=Casa Residencial
  casa_campestre: [19],
  casa_comercial: [20],
  casa_lote: [21],
  local: [5],
  oficina: [4],
  consultorio: [3],
  bodega: [6],
  edificio: [10],
  finca: [8],
  hotel: [],             // No disponible en SIMI actualmente
  lote: [7],
  parqueadero: [],       // No disponible en SIMI actualmente
};

const CITY_CACHE_TTL = 24 * 60 * 60 * 1000;
const MAX_PAGES = 100;
const PAGE_BATCH_SIZE = 5;
const parsedPropertiesTtl = Number(import.meta.env.PROPERTIES_CACHE_TTL_SECONDS || '300');
const PROPERTIES_CACHE_TTL_SECONDS =
  Number.isFinite(parsedPropertiesTtl) && parsedPropertiesTtl > 0 ? parsedPropertiesTtl : 300;
const parsedPropertiesStaleTtl = Number(import.meta.env.PROPERTIES_CACHE_STALE_SECONDS || '900');
const PROPERTIES_CACHE_STALE_SECONDS =
  Number.isFinite(parsedPropertiesStaleTtl) && parsedPropertiesStaleTtl >= 0
    ? parsedPropertiesStaleTtl
    : 900;
const PROPERTIES_PREWARM_ENABLED = import.meta.env.PROPERTIES_PREWARM_ENABLED !== 'false';
const parsedPrewarmDelayMs = Number(import.meta.env.PROPERTIES_PREWARM_DELAY_MS || '4000');
const PROPERTIES_PREWARM_DELAY_MS =
  Number.isFinite(parsedPrewarmDelayMs) && parsedPrewarmDelayMs >= 0 ? parsedPrewarmDelayMs : 4000;
const DEFAULT_PREWARM_CITIES = ['Pereira', 'Dosquebradas'];

let cachedCityMap: Map<string, string> | null = null;
let cityCacheTimestamp = 0;
const inFlightPropertyRequests = new Map<string, Promise<Property[]>>();
let prewarmScheduled = false;

// ============================================================================
// Helpers
// ============================================================================

function parsePrice(priceStr: string): number {
  if (!priceStr || priceStr === '0') return 0;
  const normalized = priceStr.replace(/[\s,$.]/g, '');
  return parseInt(normalized, 10) || 0;
}

function parseNumber(str: string): number {
  if (!str) return 0;
  const normalized = str.replace(/[\s,.$]/g, '');
  return parseInt(normalized, 10) || 0;
}

function parseArea(str: string): number {
  if (!str) return 0;
  const normalized = str.replace(/[\s,$]/g, '');
  return parseFloat(normalized) || 0;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

async function getCityIdMap(): Promise<Map<string, string>> {
  const now = Date.now();
  if (cachedCityMap && now - cityCacheTimestamp < CITY_CACHE_TTL) {
    return cachedCityMap;
  }

  const cityMap = new Map<string, string>();
  const departamentos = await getDepartamentos();
  const cityResults = await Promise.allSettled(
    departamentos.map((dep) => getCiudades(Number(dep.id)))
  );

  for (const result of cityResults) {
    if (result.status !== 'fulfilled') continue;
    for (const city of result.value) {
      cityMap.set(normalizeText(city.nombre), city.id);
    }
  }

  cachedCityMap = cityMap;
  cityCacheTimestamp = now;
  return cityMap;
}

async function resolveCityFilter(city: string): Promise<string> {
  const trimmed = city.trim();
  if (!trimmed) return '';
  if (/^\d+$/.test(trimmed)) return trimmed;

  try {
    const cityMap = await getCityIdMap();
    return cityMap.get(normalizeText(trimmed)) || trimmed;
  } catch {
    return trimmed;
  }
}

function buildPropertiesCacheKey(filters?: PropertyFilters): string {
  if (!filters) return 'properties:v1:all';

  const normalizedEntries = Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (typeof value === 'string') return [key, value.trim()];
      return [key, value];
    })
    .sort(([a], [b]) => a.localeCompare(b));

  if (normalizedEntries.length === 0) return 'properties:v1:all';

  return `properties:v1:${JSON.stringify(Object.fromEntries(normalizedEntries))}`;
}

// ============================================================================
// Transformers
// ============================================================================

function transformSimiProperty(simi: SimiInmueble): Property {
  const isArriendo = simi.idGestion === '1' || simi.Gestion?.toLowerCase().includes('arriendo');
  const ventaPrice = parsePrice(simi.Venta);
  const canonPrice = parsePrice(simi.Canon);
  const price = isArriendo ? canonPrice : ventaPrice;
  
  const tags: PropertyTag[] = [];
  if (simi.destacado === '1') tags.push('destacado');
  
  const tipoNombre = (simi.Tipo_Inmueble || '').toLowerCase();
  const propertyType: PropertyType = PROPERTY_TYPE_MAP[tipoNombre] || 'apartamento';
  
  const operationType: OperationType = isArriendo ? 'arriendo' : 'venta';
  
  // Images - SIMI filter endpoint returns foto1-foto10 as image URLs
  const images: string[] = [];
  for (let i = 1; i <= 10; i++) {
    const fotoKey = `foto${i}` as keyof SimiInmueble;
    const foto = simi[fotoKey];
    if (foto && typeof foto === 'string' && foto.trim() !== '') {
      images.push(foto);
    }
  }
  
  const lat = parseFloat(simi.latitud) || 0;
  const lng = parseFloat(simi.longitud) || 0;
  const builtArea = parseArea(simi.AreaConstruida);
  const lotArea = parseArea(simi.AreaLote);
  const area = builtArea || lotArea || 0;
  
  const title = `${simi.Tipo_Inmueble || 'Inmueble'} en ${simi.Barrio || simi.Ciudad || 'Colombia'}`;
  
  return {
    id: simi.Codigo_Inmueble,
    title,
    description: simi.descripcionlarga || '',
    price: price || 0,
    priceType: isArriendo ? 'arriendo' : 'venta',
    location: `${simi.Barrio}, ${simi.Ciudad}`,
    city: simi.Ciudad || '',
    neighborhood: simi.Barrio || simi.Zona || '',
    area,
    builtArea: builtArea || undefined,
    lotArea: lotArea || undefined,
    bedrooms: parseNumber(simi.Alcobas),
    bathrooms: parseNumber(simi.banios),
    parking: parseNumber(simi.garaje),
    stratum: parseNumber(simi.Estrato),
    images,
    tags,
    propertyType,
    operationType,
    coordinates: lat && lng ? { lat, lng } : undefined,
    videoUrl: simi.video || undefined,
    view360Url: simi.video360 || undefined,
    features: [],
    adminFee: parsePrice(simi.Administracion),
    agent: undefined,
    createdAt: simi.fingreso || new Date().toISOString(),
  };
}

// ============================================================================
// Public API
// ============================================================================

async function fetchPropertiesFromSimi(
  filters?: PropertyFilters
): Promise<{ properties: Property[]; cacheable: boolean }> {
  // If searching by code, use the detail endpoint
  if (filters?.code) {
    try {
      const property = await getPropertyById(filters.code);
      return { properties: property ? [property] : [], cacheable: true };
    } catch {
      return { properties: [], cacheable: false };
    }
  }

  try {
    const cityParam = filters?.city ? await resolveCityFilter(filters.city) : '';
    const explicitPagination = typeof filters?.limit === 'number' || typeof filters?.offset === 'number';
    const propertyTypeIds = filters?.propertyType
      ? PROPERTY_TYPE_ID_MAP[filters.propertyType] || []
      : [];
    const typeScopes = propertyTypeIds.length > 0 ? propertyTypeIds : [undefined];

    const buildBaseEndpoint = (typeId?: number): string => {
      let endpoint = '/v2.1.1/filtroInmueble';

      if (filters?.operation) {
        endpoint += `/tipOper/${OPERATION_MAP[filters.operation]}`;
      }
      if (typeId) {
        endpoint += `/tipoInm/${typeId}`;
      }
      if (cityParam) {
        endpoint += `/ciudad/${encodeURIComponent(cityParam)}`;
      }
      if (filters?.minPrice) endpoint += `/valmin/${filters.minPrice}`;
      if (filters?.maxPrice) endpoint += `/valmax/${filters.maxPrice}`;
      if (filters?.bedrooms) endpoint += `/alcobas/${filters.bedrooms}`;
      if (filters?.bathrooms) endpoint += `/banios/${filters.bathrooms}`;

      return endpoint;
    };

    const fetchSinglePage = async (baseEndpoint: string): Promise<SimiInmueble[]> => {
      const pageSize = filters?.limit || 100;
      const page = filters?.offset ? Math.floor(filters.offset / pageSize) + 1 : 1;
      const endpoint = `${baseEndpoint}/limite/${page}/cantidad/${pageSize}`;
      const data = await simiRequest<SimiFilterResponse>(endpoint);
      return Array.isArray(data?.Inmuebles) ? data.Inmuebles : [];
    };

    const fetchAllPages = async (baseEndpoint: string): Promise<SimiInmueble[]> => {
      const firstEndpoint = `${baseEndpoint}/limite/1/cantidad/100`;
      const firstPage = await simiRequest<SimiFilterResponse>(firstEndpoint);
      const firstItems = Array.isArray(firstPage?.Inmuebles) ? firstPage.Inmuebles : [];

      if (firstItems.length === 0) return [];

      const total = Number(firstPage?.datosGrales?.totalInmuebles || 0);
      const itemsPerPage = firstItems.length;
      const estimatedPages =
        total > 0
          ? Math.ceil(total / itemsPerPage)
          : Number(firstPage?.datosGrales?.totalPagina || 1);
      const totalPages = Math.max(1, Math.min(estimatedPages, MAX_PAGES));

      const allItems: SimiInmueble[] = [...firstItems];
      const pageNumbers = Array.from(
        { length: Math.max(0, totalPages - 1) },
        (_, idx) => idx + 2
      );

      for (let i = 0; i < pageNumbers.length; i += PAGE_BATCH_SIZE) {
        const batch = pageNumbers.slice(i, i + PAGE_BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map((page) =>
            simiRequest<SimiFilterResponse>(`${baseEndpoint}/limite/${page}/cantidad/100`)
          )
        );
        for (const result of results) {
          if (result.status !== 'fulfilled') continue;
          const items = Array.isArray(result.value?.Inmuebles) ? result.value.Inmuebles : [];
          if (items.length > 0) {
            allItems.push(...items);
          }
        }
      }

      return allItems;
    };

    const rawBatches = await Promise.all(
      typeScopes.map(async (typeId) => {
        const baseEndpoint = buildBaseEndpoint(typeId);
        return explicitPagination ? fetchSinglePage(baseEndpoint) : fetchAllPages(baseEndpoint);
      })
    );

    const rawUnique = new Map<string, SimiInmueble>();
    for (const batch of rawBatches) {
      for (const inmueble of batch) {
        if (!rawUnique.has(inmueble.Codigo_Inmueble)) {
          rawUnique.set(inmueble.Codigo_Inmueble, inmueble);
        }
      }
    }

    let rawProperties = Array.from(rawUnique.values());

    if (filters?.zone) {
      const zoneQuery = normalizeText(filters.zone);
      rawProperties = rawProperties.filter((p) =>
        normalizeText(`${p.Zona} ${p.Barrio}`).includes(zoneQuery)
      );
    }

    if (filters?.locationQuery) {
      const query = normalizeText(filters.locationQuery);
      rawProperties = rawProperties.filter((p) =>
        normalizeText(`${p.Ciudad} ${p.Zona} ${p.Barrio}`).includes(query)
      );
    }

    let properties = rawProperties.map(transformSimiProperty);

    // Post-fetch operation filter (SIMI API tipOper is unreliable)
    if (filters?.operation) {
      properties = properties.filter((p) => p.operationType === filters.operation);
    }

    if (filters?.minArea) {
      properties = properties.filter((p) => p.area >= filters.minArea!);
    }
    if (filters?.maxArea) {
      properties = properties.filter((p) => p.area <= filters.maxArea!);
    }
    if (filters?.parking) {
      properties = properties.filter((p) => p.parking >= filters.parking!);
    }
    if (filters?.stratum) {
      properties = properties.filter((p) => p.stratum === filters.stratum!);
    }

    console.log(
      `[SIMI] Final properties: ${properties.length} (raw unique: ${rawUnique.size}, city: ${filters?.city || 'all'})`
    );

    return { properties, cacheable: true };
  } catch (error) {
    console.error('[SIMI] Error fetching properties:', error);
    return { properties: getMockProperties(filters), cacheable: false };
  }
}

async function fetchAndCacheProperties(
  cacheKey: string,
  filters?: PropertyFilters
): Promise<Property[]> {
  const { properties, cacheable } = await fetchPropertiesFromSimi(filters);
  if (cacheable) {
    await writeCache(
      cacheKey,
      properties,
      PROPERTIES_CACHE_TTL_SECONDS,
      PROPERTIES_CACHE_STALE_SECONDS
    );
  }
  return properties;
}

function getPrewarmCities(): string[] {
  const configured = (import.meta.env.PROPERTIES_PREWARM_CITIES || '')
    .split(',')
    .map((city) => city.trim())
    .filter(Boolean);
  const base = configured.length > 0 ? configured : DEFAULT_PREWARM_CITIES;
  return [...new Set(base)];
}

async function runPropertiesPrewarm(): Promise<void> {
  if (useMock) return;

  const prewarmFilters: PropertyFilters[] = [
    {},
    ...getPrewarmCities().map((city) => ({ city })),
  ];

  console.log(`[SIMI] Starting prewarm for ${prewarmFilters.length} cache keys`);

  for (const filters of prewarmFilters) {
    try {
      await getProperties(filters);
    } catch (error) {
      console.error('[SIMI] Prewarm failed for filters:', filters, error);
    }
  }
}

function schedulePropertiesPrewarm(): void {
  if (prewarmScheduled || useMock || !PROPERTIES_PREWARM_ENABLED) return;
  prewarmScheduled = true;

  const timer = setTimeout(() => {
    void runPropertiesPrewarm();
  }, PROPERTIES_PREWARM_DELAY_MS);

  if (typeof (timer as { unref?: () => void }).unref === 'function') {
    (timer as { unref: () => void }).unref();
  }
}

export async function getProperties(filters?: PropertyFilters): Promise<Property[]> {
  if (useMock) {
    console.log('[SIMI] Using mock data - no API key configured');
    return getMockProperties(filters);
  }

  // L0: persisted Postgres cache (fast path)
  try {
    const dbCached = await getPropertiesFromDb(filters);
    if (dbCached && dbCached.length > 0) {
      console.log(`[SIMI][DB] cache hit: ${dbCached.length} properties`);
      return dbCached;
    }
  } catch (error) {
    console.error('[SIMI][DB] cache read failed, falling back to Redis/SIMI:', error);
  }

  // L1/L2: existing stale-while-revalidate cache
  const cacheKey = buildPropertiesCacheKey(filters);
  const cacheEntry = await readCacheEntry<Property[]>(cacheKey);

  if (cacheEntry && !cacheEntry.isStale) {
    console.log(`[SIMI] Cache hit (fresh): ${cacheKey}`);
    return cacheEntry.value;
  }

  if (cacheEntry?.isStale) {
    console.log(`[SIMI] Cache hit (stale): ${cacheKey} - revalidating in background`);
    if (!inFlightPropertyRequests.has(cacheKey)) {
      const revalidatePromise = fetchAndCacheProperties(cacheKey, filters)
        .then(async (properties) => {
          try {
            await upsertPropertiesToDb(properties);
          } catch (dbErr) {
            console.error('[SIMI][DB] upsert failed during revalidation (non-fatal):', dbErr);
          }
          return properties;
        })
        .finally(() => {
          inFlightPropertyRequests.delete(cacheKey);
        });
      inFlightPropertyRequests.set(cacheKey, revalidatePromise);
    }
    return cacheEntry.value;
  }

  const existingRequest = inFlightPropertyRequests.get(cacheKey);
  if (existingRequest) {
    return existingRequest;
  }

  const requestPromise = fetchAndCacheProperties(cacheKey, filters)
    .then(async (properties) => {
      try {
        await upsertPropertiesToDb(properties);
      } catch (dbErr) {
        console.error('[SIMI][DB] upsert failed (non-fatal):', dbErr);
      }
      return properties;
    })
    .finally(() => {
      inFlightPropertyRequests.delete(cacheKey);
    });
  inFlightPropertyRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

schedulePropertiesPrewarm();

export async function syncSimiPropertiesToDb(
  filters?: PropertyFilters
): Promise<{ synced: number; deactivated: number }> {
  if (useMock) return { synced: 0, deactivated: 0 };

  await updateSyncState('running', 'Iniciando sincronización SIMI');
  try {
    const { properties } = await fetchPropertiesFromSimi(filters);
    await upsertPropertiesToDb(properties);

    // Garantiza sincronización de eliminadas dentro del alcance del sync actual.
    const deactivated = await deactivateMissingPropertiesFromSync(
      properties.map((p) => p.id),
      {
        operation: filters?.operation,
        propertyType: filters?.propertyType,
        city: filters?.city,
      }
    );

    await updateSyncState(
      'success',
      `Sincronizadas ${properties.length} propiedades, desactivadas ${deactivated}`
    );
    return { synced: properties.length, deactivated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    await updateSyncState('error', message);
    throw error;
  }
}

export async function getFeaturedProperties(cantidad: number = 10): Promise<Property[]> {
  if (useMock) {
    console.log('[SIMI] Using mock data - no API key configured');
    return getMockProperties({ featured: true, limit: cantidad });
  }

  try {
    const endpoint = `/v21/inmueblesDestacados/limite/1/cantidad/${cantidad}`;
    const data = await simiRequest<SimiFilterResponse | SimiInmueble[]>(endpoint);
    
    // Handle both possible response formats
    let inmuebles: SimiInmueble[];
    if (Array.isArray(data)) {
      inmuebles = data;
    } else if (data && 'Inmuebles' in data) {
      inmuebles = data.Inmuebles;
    } else {
      console.warn('[SIMI] Unexpected featured response format:', data);
      return getMockProperties({ featured: true, limit: cantidad });
    }
    
    console.log(`[SIMI] Found ${inmuebles.length} featured properties`);
    
    return inmuebles.map(transformSimiProperty);
  } catch (error) {
    console.error('[SIMI] Error fetching featured properties:', error);
    // Fallback: get recent properties instead
    return getProperties({ limit: cantidad });
  }
}

// Transform detailed property response (from /v2/inmueble/codInmueble endpoint)
function transformSimiInmuebleDetalle(data: SimiInmuebleDetalle): Property {
  const isArriendo = data.Gestion?.toLowerCase().includes('arriendo') || data.IdGestion === '1';
  const price = parsePrice(isArriendo ? data.ValorCanon : data.ValorVenta);
  
  // Collect all photos from the fotos array
  const images: string[] = [];
  if (data.fotos && Array.isArray(data.fotos)) {
    data.fotos
      .sort((a, b) => parseInt(a.posi) - parseInt(b.posi))
      .forEach(f => {
        if (f.foto && f.foto.trim()) {
          images.push(f.foto);
        }
      });
  }
  console.log('[SIMI] Detalle endpoint - photos found:', images.length);

  const title = `${data.Tipo_Inmueble || 'Inmueble'} en ${data.barrio || data.ciudad || 'Colombia'}`;
  const tipoNombre = (data.Tipo_Inmueble || '').toLowerCase().trim();
  const propertyType: PropertyType = PROPERTY_TYPE_MAP[tipoNombre] || 'apartamento';
  const operationType: OperationType = isArriendo ? 'arriendo' : 'venta';
  const builtArea = parseArea(data.AreaConstruida);
  const lotArea = parseArea(data.AreaLote);
  const area = builtArea || lotArea || 0;

  return {
    id: data.idInm,
    title,
    description: data.descripcionlarga || '',
    price: price || 0,
    priceType: isArriendo ? 'arriendo' : 'venta',
    location: `${data.barrio}, ${data.ciudad}`,
    city: data.ciudad || '',
    neighborhood: data.barrio || data.zona || '',
    area,
    builtArea: builtArea || undefined,
    lotArea: lotArea || undefined,
    bedrooms: parseNumber(data.alcobas),
    bathrooms: parseNumber(data.banos),
    parking: parseNumber(data.garaje),
    stratum: parseNumber(data.Estrato),
    images,
    tags: [],
    propertyType,
    operationType,
    coordinates: parseFloat(data.latitud) && parseFloat(data.longitud) 
      ? { lat: parseFloat(data.latitud), lng: parseFloat(data.longitud) } 
      : undefined,
    videoUrl: data.video || undefined,
    view360Url: data.video360 || undefined,
    features: [],
    adminFee: 0,
    agent: undefined,
    createdAt: new Date().toISOString(),
  };
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  if (useMock) {
    console.log('[SIMI] Using mock data - no API key configured');
    return getMockPropertyById(id);
  }

  // Extract internal ID - format is "188-2470" where 188 is inmobiliaria and 2470 is property
  const internalId = id.includes('-') ? id.split('-')[1] : id;

  // Try the detailed property endpoint first (returns fotos array)
  const detailEndpoints = [
    `/v2/inmueble/codInmueble/${id}`,
    `/v2/inmueble/codInmueble/${internalId}`,
  ];

  for (const endpoint of detailEndpoints) {
    try {
      console.log('[SIMI] Trying detail endpoint:', endpoint);
      const data = await simiRequest<SimiInmuebleDetalle>(endpoint);
      
      // Check if we got a valid response with the fotos array
      if (data && (data.idInm || data.codinm)) {
        console.log('[SIMI] Found property via detail endpoint:', endpoint);
        console.log('[SIMI] Photos in response:', data.fotos?.length || 0);
        return transformSimiInmuebleDetalle(data);
      }
    } catch (error) {
      console.log('[SIMI] Detail endpoint failed:', endpoint);
    }
  }

  // Fallback: search via filter endpoint (only returns foto1)
  try {
    console.log('[SIMI] Trying filter fallback for:', id);
    const endpoint = `/v2.1.1/filtroInmueble/limite/1/cantidad/20`;
    const data = await simiRequest<SimiFilterResponse>(endpoint);

    if (data.Inmuebles && Array.isArray(data.Inmuebles)) {
      const inmueble = data.Inmuebles.find(
        (p) => p.Codigo_Inmueble === id || p.codInterno === internalId
      );

      if (inmueble) {
        console.log('[SIMI] Found property via filter fallback (limited photos)');
        return transformSimiProperty(inmueble);
      }
    }
  } catch (error) {
    console.error('[SIMI] Filter fallback failed:', error);
  }

  console.warn('[SIMI] Property not found after all attempts:', id);
  return getMockPropertyById(id);
}

// ============================================================================
// Catalog APIs (for filters)
// ============================================================================

export async function getDepartamentos(): Promise<SimiDepartamento[]> {
  if (useMock) return [];
  
  try {
    const data = await simiRequest<SimiDepartamento[]>('/v2/departamento');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[SIMI] Error fetching departamentos:', error);
    return [];
  }
}

export async function getCiudades(idDepartamento: number = 0): Promise<SimiCiudad[]> {
  if (useMock) return [];
  
  try {
    const data = await simiRequest<SimiCiudad[]>(`/v2/ciudad/idDepartamento/${idDepartamento}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[SIMI] Error fetching ciudades:', error);
    return [];
  }
}

export async function getTiposInmueble(): Promise<SimiTipoInmueble[]> {
  if (useMock) return [];

  try {
    const data = await simiRequest<SimiTipoInmueble[]>('/v2/tipoInmuebles/unique/1');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[SIMI] Error fetching tipos de inmueble:', error);
    return [];
  }
}

export async function getZonas(idCiudad: string): Promise<{ id: string; nombre: string }[]> {
  if (useMock) return [];

  try {
    const data = await simiRequest<SimiZonasResponse | SimiZona[]>(`/zonas/idCiudad/${idCiudad}`);
    const raw = Array.isArray(data)
      ? data
      : data && 'zonas' in data && Array.isArray(data.zonas)
        ? data.zonas
        : [];
    // Normalize nomZona → nombre
    return raw.map((z) => ({ id: z.id, nombre: z.nomZona }));
  } catch (error) {
    console.error(`[SIMI] Error fetching zonas for ciudad ${idCiudad}:`, error);
    return [];
  }
}

export async function getBarrios(idCiudad: string): Promise<SimiBarrio[]> {
  if (useMock) return [];

  try {
    const data = await simiRequest<SimiBarriosResponse | SimiBarrio[]>(`/v2/barrios/idCiudad/${idCiudad}/idZona/0`);
    if (Array.isArray(data)) return data;
    if (data && 'barrios' in data && Array.isArray(data.barrios)) return data.barrios;
    return [];
  } catch (error) {
    console.error(`[SIMI] Error fetching barrios for ciudad ${idCiudad}:`, error);
    return [];
  }
}
