import type { Property, PropertyFilters, Agent, PropertyType, OperationType, PropertyTag } from './types';
import { getMockProperties, getMockPropertyById } from './mockData';

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
  'apartaestudio': 'apartamento',
  'casa': 'casa',
  'local': 'local',
  'locales': 'local',
  'oficina': 'oficina',
  'oficinas': 'oficina',
  'consultorio': 'oficina',
  'consultorios': 'oficina',
  'lote': 'lote',
  'lotes': 'lote',
  'bodega': 'bodega',
  'bodegas': 'bodega',
  'finca': 'finca',
  'fincas': 'finca',
};

const PROPERTY_TYPE_ID_MAP: Record<PropertyType, number[]> = {
  apartamento: [1, 11],
  casa: [2, 19, 20, 21, 22],
  local: [5],
  oficina: [3, 4],
  lote: [7],
  bodega: [6],
  finca: [8],
};

// ============================================================================
// Helpers
// ============================================================================

function parsePrice(priceStr: string): number {
  if (!priceStr || priceStr === '0') return 0;
  // Remove commas and parse
  return parseInt(priceStr.replace(/,/g, ''), 10) || 0;
}

function parseNumber(str: string): number {
  if (!str) return 0;
  return parseInt(str.replace(/,/g, ''), 10) || 0;
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
    area: parseNumber(simi.AreaConstruida) || parseNumber(simi.AreaLote) || 0,
    bedrooms: parseNumber(simi.Alcobas),
    bathrooms: parseNumber(simi.banios),
    parking: parseNumber(simi.garaje),
    stratum: parseNumber(simi.Estrato),
    images,
    tags,
    propertyType,
    operationType,
    coordinates: lat && lng ? { lat, lng } : undefined,
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

export async function getProperties(filters?: PropertyFilters): Promise<Property[]> {
  if (useMock) {
    console.log('[SIMI] Using mock data - no API key configured');
    return getMockProperties(filters);
  }

  try {
    // Build URL path with parameters
    let endpoint = '/v2.1.1/filtroInmueble';
    
    // Pagination
    const page = filters?.offset ? Math.floor(filters.offset / (filters.limit || 20)) + 1 : 1;
    endpoint += `/limite/${page}`;
    endpoint += `/cantidad/${filters?.limit || 20}`;
    
    // Operation type
    if (filters?.operation) {
      endpoint += `/tipOper/${OPERATION_MAP[filters.operation]}`;
    }
    
    // Property type
    if (filters?.propertyType) {
      const typeIds = PROPERTY_TYPE_ID_MAP[filters.propertyType];
      if (typeIds && typeIds.length > 0) {
        endpoint += `/tipoInm/${typeIds[0]}`;
      }
    }

    // City filter
    if (filters?.city) {
      endpoint += `/ciudad/${encodeURIComponent(filters.city)}`;
    }

    // Price range
    if (filters?.minPrice) endpoint += `/valmin/${filters.minPrice}`;
    if (filters?.maxPrice) endpoint += `/valmax/${filters.maxPrice}`;

    // Bedrooms/bathrooms
    if (filters?.bedrooms) endpoint += `/alcobas/${filters.bedrooms}`;
    if (filters?.bathrooms) endpoint += `/banios/${filters.bathrooms}`;

    const data = await simiRequest<SimiFilterResponse>(endpoint);

    if (!data.Inmuebles || !Array.isArray(data.Inmuebles)) {
      console.warn('[SIMI] Unexpected response format:', data);
      return getMockProperties(filters);
    }

    console.log(`[SIMI] Found ${data.Inmuebles.length} properties (total: ${data.datosGrales?.totalInmuebles})`);

    let properties = data.Inmuebles.map(transformSimiProperty);

    // Client-side filtering for city if API doesn't support it
    // This ensures the filter works even if the /ciudad/{city} parameter is not supported by SIMI API
    if (filters?.city) {
      properties = properties.filter((p) =>
        p.city.toLowerCase() === filters.city!.toLowerCase()
      );
      console.log(`[SIMI] Filtered by city "${filters.city}": ${properties.length} properties`);
    }

    return properties;
  } catch (error) {
    console.error('[SIMI] Error fetching properties:', error);
    return getMockProperties(filters);
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

  return {
    id: data.idInm,
    title,
    description: data.descripcionlarga || '',
    price: price || 0,
    priceType: isArriendo ? 'arriendo' : 'venta',
    location: `${data.barrio}, ${data.ciudad}`,
    city: data.ciudad || '',
    neighborhood: data.barrio || data.zona || '',
    area: parseNumber(data.AreaConstruida) || parseNumber(data.AreaLote) || 0,
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
