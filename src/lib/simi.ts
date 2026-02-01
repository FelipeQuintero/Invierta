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
  
  // Images - SIMI returns foto1 as main image URL
  const images: string[] = [];
  if (simi.foto1) {
    images.push(simi.foto1);
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
    
    return data.Inmuebles.map(transformSimiProperty);
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

export async function getPropertyById(id: string): Promise<Property | undefined> {
  if (useMock) {
    console.log('[SIMI] Using mock data - no API key configured');
    return getMockPropertyById(id);
  }

  try {
    const endpoint = `/v2/inmueble/codInmueble/${id}`;
    console.log('[SIMI] Fetching property:', endpoint);
    const data = await simiRequest<SimiInmueble | SimiInmueble[]>(endpoint);
    
    // Handle both single object and array responses
    const inmueble = Array.isArray(data) ? data[0] : data;
    
    if (!inmueble || !inmueble.Codigo_Inmueble) {
      console.warn('[SIMI] Property not found:', id);
      return undefined;
    }
    
    return transformSimiProperty(inmueble);
  } catch (error) {
    console.error('[SIMI] Error fetching property:', error);
    return getMockPropertyById(id);
  }
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
