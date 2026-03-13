export type ConstructionStage = 'preventa' | 'en_construccion' | 'entrega_inmediata';

export interface Project {
  id: string;
  slug: string;
  name: string;
  developer?: string;
  description?: string;
  shortDescription?: string;
  city: string;
  zone?: string;
  neighborhood?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  constructionStage: ConstructionStage;
  deliveryDate?: string;
  priceFrom?: number;
  priceTo?: number;
  amenities: string[];
  images: string[];
  coverImage?: string;
  videoUrl?: string;
  brochureUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  typologies?: ProjectTypology[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTypology {
  id: string;
  projectId: string;
  name: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking: number;
  price?: number;
  floorPlanImage?: string;
  availableUnits?: number;
  totalUnits?: number;
  features: string[];
  sortOrder: number;
}
