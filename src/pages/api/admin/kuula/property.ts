export const prerender = false;

import type { APIRoute } from 'astro';
import { getPropertyById } from '../../../../lib/simi';
import { isAdminRequestAuthorized, isAdminTokenConfigured } from '../../../../lib/adminAuth';
import { getKuulaEmbedUrl } from '../../../../lib/kuula';

export const GET: APIRoute = async ({ request, url, cookies }) => {
  if (!isAdminTokenConfigured()) {
    return new Response(JSON.stringify({ error: 'ADMIN_TOKEN no configurado en el servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!isAdminRequestAuthorized(request, cookies)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const query = (url.searchParams.get('propertyId') || url.searchParams.get('code') || '').trim();

  if (!query) {
    return new Response(JSON.stringify({ error: 'Debe enviar propertyId o code' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const property = await getPropertyById(query);

  if (!property) {
    return new Response(JSON.stringify({ error: 'Propiedad no encontrada' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const kuulaEmbedUrl = (await getKuulaEmbedUrl(query)) || (await getKuulaEmbedUrl(property.id));

  return new Response(
    JSON.stringify({
      data: {
        property: {
          id: property.id,
          title: property.title,
          city: property.city,
          neighborhood: property.neighborhood,
          operationType: property.operationType,
          propertyType: property.propertyType,
        },
        kuulaEmbedUrl: kuulaEmbedUrl || null,
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
