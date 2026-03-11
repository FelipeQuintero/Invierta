export const prerender = false;

import type { APIRoute } from 'astro';
import { getAdminAuthState } from '../../../../lib/adminAuth';
import { searchPropertiesForAdmin } from '../../../../lib/kuula';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request, url, cookies }) => {
  const auth = await getAdminAuthState(request, cookies, ['admin', 'editor']);
  if (!auth.isAuthenticated) return json({ error: 'No autorizado' }, 401);

  const q = (url.searchParams.get('q') || '').trim();
  if (!q) return json({ error: 'q es requerido' }, 400);

  const limit = Number(url.searchParams.get('limit') || '20');
  const data = await searchPropertiesForAdmin(q, Number.isFinite(limit) ? limit : 20);

  return json({ data, count: data.length });
};
