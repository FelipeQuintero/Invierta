import type { Property, PropertyFilters, Agent, PropertyType, OperationType, PropertyTag } from './types';
import { getMockProperties, getMockPropertyById } from './mockData';

const SIMI_API_URL = import.meta.env.SIMI_API_URL || 'http://simi-api.com/ApiSimiweb/response';
const SIMI_API_KEY = import.meta.env.SIMI_API_KEY;

const useMock = !SIMI_API_KEY;

// ============================================================================
// SIMI API Response Types
// ============================================================================

interface SimiInmueble {
  // Identificación
  codigo: string;
  codInmueble: number;
  consecutivo: number;
  
  // Clasificación
  nombreTipoInmueble: string;
  tipoInmueble?: string;
  idTipoInmueble: number;
  gestion: string;
  idGestion: number;
  estado: string;
  
  // Precios
  canon: number;
  venta: number;
  administracion: number;
  
  // Ubicación
  departamento: string;
  ciudad: string;
  zona: string;
  barrio: string;
  direccion: string;
  latitud: number;
  longitud: number;
  
  // Características físicas
  estrato: number;
  areaLote: number;
  areaConstruida: number;
  habitaciones: number;
  banos: number;
  parqueaderos: number;
  
  // Características adicionales
  caracteristicasInternas: string[];
  caracteristicasExternas: string[];
  descripcion: string;
  
  // Metadata
  fechaConsignacion: string;
  destacado: boolean;
  
  // Multimedia
  fotos: SimiFoto[];
  video360?: string;
  
  // Asesor
  promotor?: SimiAsesor;
}

interface SimiFoto {
  url: string;
  principal: boolean;
}

interface SimiAsesor {
  nombre: string;
  telefono: string;
  email: string;
  foto?: string;
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
  // SIMI uses Basic Auth with format: Authorization:TOKEN
  const credentials = `Authorization:${SIMI_API_KEY}`;
  // btoa equivalent for Node.js
  const base64 = typeof btoa !== 'undefined' 
    ? btoa(credentials)
    : Buffer.from(credentials).toString('base64');
  return `Basic ${base64}`;
}

async function simiRequest<T>(endpoint: string): Promise<T> {
  const url = `${SIMI_API_URL}${endpoint}`;
  
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
  
  // SIMI returns array directly for most endpoints
  // Some endpoints return {code, response} format
  if (data && typeof data === 'object' && 'code' in data) {
    if (data.code !== 0) {
      throw new Error(`SIMI API Error: code ${data.code}`);
    }
    return data.response as T;
  }
  
  return data as T;
}

// ============================================================================
// Type Mappings
// ============================================================================

const OPERATION_MAP: Record<OperationType, number> = {
  arriendo: 1,
  venta: 5,
  proyecto: 5, // Proyectos son tipo venta
};

const PROPERTY_TYPE_MAP: Record<string, PropertyType> = {
  'apartamento': 'apartamento',
  'apartaestudio': 'apartamento',
  'casa': 'casa',
  'casa campestre': 'casa',
  'casa comercial': 'casa',
  'casa lote': 'casa',
  'casa residencial': 'casa',
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
  apartamento: [1, 11], // Apartamento, Apartaestudio
  casa: [2, 19, 20, 21, 22], // Casa y variantes
  local: [5], // Locales
  oficina: [3, 4], // Consultorios, Oficinas
  lote: [7], // Lotes
  bodega: [6], // Bodega
  finca: [8], // Fincas
};

// ============================================================================
// Transformers
// ============================================================================

function transformSimiProperty(simi: SimiInmueble): Property {
  const isArriendo = simi.idGestion === 1 || simi.gestion?.toLowerCase().includes('arriendo');
  const price = isArriendo ? simi.canon : simi.venta;
  
  const tags: PropertyTag[] = [];
  if (simi.destacado) tags.push('destacado');
  
  const tipoNombre = (simi.nombreTipoInmueble || simi.tipoInmueble || '').toLowerCase();
  const propertyType: PropertyType = PROPERTY_TYPE_MAP[tipoNombre] || 'apartamento';
  
  const operationType: OperationType = isArriendo ? 'arriendo' : 'venta';
  
  // Handle fotos - can be array of objects or array of strings
  let images: string[] = [];
  if (simi.fotos && Array.isArray(simi.fotos)) {
    images = simi.fotos.map(f => {
      if (typeof f === 'string') return f;
      return f.url;
    }).filter(Boolean);
    
    // Sort to put principal photo first if we have objects
    if (simi.fotos.length > 0 && typeof simi.fotos[0] === 'object') {
      const fotosObjs = simi.fotos as SimiFoto[];
      images = fotosObjs
        .sort((a, b) => (b.principal ? 1 : 0) - (a.principal ? 1 : 0))
        .map(f => f.url)
        .filter(Boolean);
    }
  }
  
  const features = [
    ...(simi.caracteristicasInternas || []),
    ...(simi.caracteristicasExternas || []),
  ];
  
  let agent: Agent | undefined;
  if (simi.promotor) {
    agent = {
      name: simi.promotor.nombre,
      phone: simi.promotor.telefono,
      email: simi.promotor.email,
      photo: simi.promotor.foto,
    };
  }
  
  const locationParts = [simi.barrio, simi.zona, simi.ciudad].filter(Boolean);
  const title = `${simi.nombreTipoInmueble || simi.tipoInmueble || 'Inmueble'} en ${locationParts[0] || 'Colombia'}`;
  
  return {
    id: simi.codigo || String(simi.codInmueble),
    title,
    description: simi.descripcion || '',
    price: price || 0,
    priceType: isArriendo ? 'arriendo' : 'venta',
    location: simi.direccion || locationParts.join(', '),
    city: simi.ciudad || '',
    neighborhood: simi.barrio || simi.zona || '',
    area: simi.areaConstruida || simi.areaLote || 0,
    bedrooms: simi.habitaciones || 0,
    bathrooms: simi.banos || 0,
    parking: simi.parqueaderos || 0,
    stratum: simi.estrato || 0,
    images,
    tags,
    propertyType,
    operationType,
    coordinates: simi.latitud && simi.longitud ? {
      lat: Number(simi.latitud),
      lng: Number(simi.longitud),
    } : undefined,
    view360Url: simi.video360,
    features,
    adminFee: simi.administracion,
    agent,
    createdAt: simi.fechaConsignacion || new Date().toISOString(),
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
    // Build URL path with parameters (SIMI uses path params, not query strings)
    let endpoint = '/v2.1.1/filtroInmueble';
    
    // Paginación (SIMI usa limite como página, no offset)
    const page = filters?.offset ? Math.floor(filters.offset / (filters.limit || 20)) + 1 : 1;
    endpoint += `/limite/${page}`;
    endpoint += `/cantidad/${filters?.limit || 20}`;
    
    // Tipo de operación
    if (filters?.operation) {
      endpoint += `/tipOper/${OPERATION_MAP[filters.operation]}`;
    }
    
    // Tipo de inmueble
    if (filters?.propertyType) {
      const typeIds = PROPERTY_TYPE_ID_MAP[filters.propertyType];
      if (typeIds && typeIds.length > 0) {
        endpoint += `/tipoInm/${typeIds[0]}`;
      }
    }
    
    // Rango de precio
    if (filters?.minPrice) endpoint += `/valmin/${filters.minPrice}`;
    if (filters?.maxPrice) endpoint += `/valmax/${filters.maxPrice}`;
    
    // Características
    if (filters?.bedrooms) endpoint += `/alcobas/${filters.bedrooms}`;
    if (filters?.bathrooms) endpoint += `/banios/${filters.bathrooms}`;

    console.log('[SIMI] Fetching:', endpoint);
    const data = await simiRequest<SimiInmueble[]>(endpoint);
    
    if (!Array.isArray(data)) {
      console.warn('[SIMI] Unexpected response format:', data);
      return getMockProperties(filters);
    }
    
    return data.map(transformSimiProperty);
  } catch (error) {
    console.error('[SIMI] Error fetching properties:', error);
    // Fallback to mock data on error
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
    console.log('[SIMI] Fetching featured:', endpoint);
    const data = await simiRequest<SimiInmueble[]>(endpoint);
    
    if (!Array.isArray(data)) {
      console.warn('[SIMI] Unexpected response format:', data);
      return getMockProperties({ featured: true, limit: cantidad });
    }
    
    return data.map(transformSimiProperty);
  } catch (error) {
    console.error('[SIMI] Error fetching featured properties:', error);
    return getMockProperties({ featured: true, limit: cantidad });
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
    const data = await simiRequest<SimiInmueble>(endpoint);
    
    if (!data) return undefined;
    
    return transformSimiProperty(data);
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
