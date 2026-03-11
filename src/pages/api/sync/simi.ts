import type { APIRoute } from 'astro';
import { syncSimiPropertiesToDb } from '../../../lib/simi';
import type { OperationType, PropertyType, PropertyFilters } from '../../../lib/types';

export const prerender = false;

function unauthorized() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseFilters(url: URL): PropertyFilters {
  const params = url.searchParams;
  const filters: PropertyFilters = {};

  const operation = params.get('operation');
  if (operation) filters.operation = operation as OperationType;

  const city = params.get('city');
  if (city) filters.city = city;

  const propertyType = params.get('propertyType');
  if (propertyType) filters.propertyType = propertyType as PropertyType;

  return filters;
}

export const POST: APIRoute = async ({ request }) => {
  const syncToken = import.meta.env.SIMI_SYNC_TOKEN;
  if (syncToken) {
    const token = request.headers.get('x-sync-token');
    if (token !== syncToken) return unauthorized();
  }

  const filters = parseFilters(new URL(request.url));
  const result = await syncSimiPropertiesToDb(filters);

  return new Response(JSON.stringify({ ok: true, ...result, filters }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
