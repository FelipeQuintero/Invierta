export const prerender = false;

import type { APIRoute } from 'astro';
import { getAdminAuthState } from '../../../../lib/adminAuth';
import { getKuulaLinkHistory } from '../../../../lib/kuula';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request, url, cookies }) => {
  const auth = await getAdminAuthState(request, cookies, ['admin', 'editor']);
  if (!auth.isAuthenticated) return json({ error: 'No autorizado' }, 401);

  const propertyId = (url.searchParams.get('propertyId') || '').trim();
  const limit = Number(url.searchParams.get('limit') || '30');
  const data = await getKuulaLinkHistory({
    propertyId: propertyId || undefined,
    limit: Number.isFinite(limit) ? limit : 30,
  });

  return json({ data, count: data.length });
};
