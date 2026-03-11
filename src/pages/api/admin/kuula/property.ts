export const prerender = false;

import type { APIRoute } from 'astro';
import { isAdminRequestAuthorized, isAdminTokenConfigured } from '../../../../lib/adminAuth';
import { getKuulaEmbedUrl } from '../../../../lib/kuula';
import { getPropertyById } from '../../../../lib/simi';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request, url, cookies }) => {
  if (!isAdminTokenConfigured()) return json({ error: 'ADMIN_TOKEN no configurado en el servidor' }, 500);
  if (!isAdminRequestAuthorized(request, cookies)) return json({ error: 'No autorizado' }, 401);

  const propertyId = (url.searchParams.get('propertyId') || '').trim();
  if (!propertyId) return json({ error: 'propertyId es requerido' }, 400);

  const property = await getPropertyById(propertyId);
  const kuulaEmbedUrl = await getKuulaEmbedUrl(propertyId);

  return json({
    data: {
      propertyId,
      found: Boolean(property),
      property: property
        ? {
            id: property.id,
            title: property.title,
            city: property.city,
            neighborhood: property.neighborhood,
            operationType: property.operationType,
            propertyType: property.propertyType,
          }
        : null,
      kuulaEmbedUrl: kuulaEmbedUrl || null,
    },
  });
};
