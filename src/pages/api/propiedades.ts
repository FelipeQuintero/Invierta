// NOTE: This API route requires Astro server output mode (output: 'server' or 'hybrid')
// in astro.config.mjs. Without it, this endpoint will not work at runtime.

import type { APIRoute } from 'astro';
import { getProperties } from '../../lib/simi';
import type { PropertyFilters, OperationType, PropertyType } from '../../lib/types';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    const filters: PropertyFilters = {};

    const operation = params.get('operation');
    if (operation) {
      filters.operation = operation as OperationType;
    }

    const propertyType = params.get('propertyType');
    if (propertyType) {
      filters.propertyType = propertyType as PropertyType;
    }

    const city = params.get('city');
    if (city) {
      filters.city = city;
    }

    const minPrice = params.get('minPrice');
    if (minPrice) {
      const parsed = Number(minPrice);
      if (!isNaN(parsed)) {
        filters.minPrice = parsed;
      }
    }

    const maxPrice = params.get('maxPrice');
    if (maxPrice) {
      const parsed = Number(maxPrice);
      if (!isNaN(parsed)) {
        filters.maxPrice = parsed;
      }
    }

    const bedrooms = params.get('bedrooms');
    if (bedrooms) {
      const parsed = Number(bedrooms);
      if (!isNaN(parsed)) {
        filters.bedrooms = parsed;
      }
    }

    const featured = params.get('featured');
    if (featured === 'true') {
      filters.featured = true;
    }

    const limit = params.get('limit');
    if (limit) {
      const parsed = Number(limit);
      if (!isNaN(parsed) && parsed > 0) {
        filters.limit = parsed;
      }
    }

    const offset = params.get('offset');
    if (offset) {
      const parsed = Number(offset);
      if (!isNaN(parsed) && parsed >= 0) {
        filters.offset = parsed;
      }
    }

    const query = params.get('query');
    if (query) {
      filters.query = query;
    }

    const properties = await getProperties(filters);

    return new Response(JSON.stringify({ data: properties, count: properties.length }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching properties:', error);

    const message =
      error instanceof Error ? error.message : 'Error interno del servidor';

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
