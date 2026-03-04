export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: 'venta' | 'arriendo';
  location: string;
  city: string;
  neighborhood: string;
  area: number;
  builtArea?: number;
  lotArea?: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  stratum: number;
  images: string[];
  tags: PropertyTag[];
  propertyType: PropertyType;
  operationType: OperationType;
  coordinates?: Coordinates;
  view360Url?: string;
  features: string[];
  yearBuilt?: number;
  adminFee?: number;
  agent?: Agent;
  createdAt: string;
}

export type PropertyTag = 'destacado' | 'negociable' | 'bajo_precio' | 'nuevo';

export type PropertyType =
  | 'apartamento'
  | 'casa'
  | 'casa_campestre'
  | 'local'
  | 'oficina'
  | 'consultorio'
  | 'lote'
  | 'bodega'
  | 'finca';

export type OperationType = 'venta' | 'arriendo' | 'proyecto';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Agent {
  name: string;
  phone: string;
  email: string;
  photo?: string;
}

export interface PropertyFilters {
  operation?: OperationType;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  zone?: string;
  query?: string;
  code?: string;
  locationQuery?: string;
  minArea?: number;
  maxArea?: number;
  parking?: number;
  stratum?: number;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export interface SiteConfig {
  name: string;
  logo: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
  };
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
}

export interface ServiceInfo {
  slug: string;
  title: string;
  shortDescription: string;
  icon: string;
}

export interface TopBarLink {
  href: string;
  label: string;
  icon: string;
  external: boolean;
}
