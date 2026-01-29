import type { Property, PropertyFilters } from './types';
import { getMockProperties, getMockPropertyById } from './mockData';

const SIMI_API_URL = import.meta.env.SIMI_API_URL;
const SIMI_API_KEY = import.meta.env.SIMI_API_KEY;

const useMock = !SIMI_API_URL || !SIMI_API_KEY;

export async function getProperties(filters?: PropertyFilters): Promise<Property[]> {
  if (useMock) {
    return getMockProperties(filters);
  }

  const params = new URLSearchParams();
  if (filters?.operation) params.set('operation', filters.operation);
  if (filters?.propertyType) params.set('propertyType', filters.propertyType);
  if (filters?.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters?.bedrooms) params.set('bedrooms', String(filters.bedrooms));
  if (filters?.city) params.set('city', filters.city);
  if (filters?.featured) params.set('featured', 'true');
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.offset) params.set('offset', String(filters.offset));

  const response = await fetch(`${SIMI_API_URL}/properties?${params}`, {
    headers: {
      Authorization: `Bearer ${SIMI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`SIMI API error: ${response.status}`);
  }

  return response.json();
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  if (useMock) {
    return getMockPropertyById(id);
  }

  const response = await fetch(`${SIMI_API_URL}/properties/${id}`, {
    headers: {
      Authorization: `Bearer ${SIMI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error(`SIMI API error: ${response.status}`);
  }

  return response.json();
}
