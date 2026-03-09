// NOTE: This API route requires Astro server output mode (output: 'server' or 'hybrid')
// in astro.config.mjs. Without it, this endpoint will not work at runtime.

export const prerender = false;

import type { APIRoute } from 'astro';
import { getPropertyById } from '../../../lib/simi';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID de propiedad requerido' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const property = await getPropertyById(id);

    if (!property) {
      return new Response(
        JSON.stringify({ error: 'Propiedad no encontrada' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(JSON.stringify({ data: property }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching property:', error);

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
