export const prerender = false;

import type { APIRoute } from 'astro';
import { getAdminAuthState } from '../../../lib/adminAuth';
import { getKuulaEmbedUrl, isValidKuulaEmbedUrl, normalizeKuulaUrl, upsertKuulaEmbedUrl } from '../../../lib/kuula';

interface KuulaPayload {
  propertyId?: string;
  kuulaEmbedUrl?: string;
}

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
  if (!propertyId) return json({ error: 'propertyId es requerido' }, 400);

  const kuulaEmbedUrl = await getKuulaEmbedUrl(propertyId);
  return json({ data: { propertyId, kuulaEmbedUrl: kuulaEmbedUrl || null } });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await getAdminAuthState(request, cookies, ['admin', 'editor']);
  if (!auth.isAuthenticated) return json({ error: 'No autorizado' }, 401);

  let payload: KuulaPayload;
  try {
    payload = (await request.json()) as KuulaPayload;
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  const propertyId = payload.propertyId?.trim();
  const kuulaEmbedUrl = payload.kuulaEmbedUrl?.trim();

  if (!propertyId || !kuulaEmbedUrl) {
    return json({ error: 'propertyId y kuulaEmbedUrl son requeridos' }, 400);
  }

  if (!isValidKuulaEmbedUrl(kuulaEmbedUrl)) {
    return json({ error: 'La URL no es válida o no corresponde a Kuula' }, 400);
  }

  const changedBy = request.headers.get('x-admin-user')?.trim() || 'admin_token';
  await upsertKuulaEmbedUrl(propertyId, normalizeKuulaUrl(kuulaEmbedUrl), changedBy);
  return json({ ok: true, data: { propertyId, kuulaEmbedUrl: normalizeKuulaUrl(kuulaEmbedUrl) } });
};
