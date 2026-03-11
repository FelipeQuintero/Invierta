export const prerender = false;

import type { APIRoute } from 'astro';
import { getAdminAuthState } from '../../../../lib/adminAuth';
import { getPropertyById } from '../../../../lib/simi';
import { isValidKuulaEmbedUrl, normalizeKuulaUrl, upsertKuulaEmbedUrl } from '../../../../lib/kuula';

interface RowInput {
  propertyId?: string;
  kuulaUrl?: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await getAdminAuthState(request, cookies, ['admin', 'editor']);
  if (!auth.isAuthenticated) return json({ error: 'No autorizado' }, 401);

  let payload: { rows?: RowInput[] };
  try {
    payload = (await request.json()) as { rows?: RowInput[] };
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  if (rows.length === 0) return json({ error: 'rows es requerido y debe tener al menos 1 fila' }, 400);

  const changedBy = request.headers.get('x-admin-user')?.trim() || 'admin_bulk_api';

  const result = {
    total: rows.length,
    ok: 0,
    error: 0,
    rows: [] as Array<{ row: number; propertyId: string; ok: boolean; message: string }>,
  };

  for (let i = 0; i < rows.length; i += 1) {
    const rowNumber = i + 1;
    const propertyId = String(rows[i]?.propertyId || '').trim();
    const kuulaUrl = String(rows[i]?.kuulaUrl || '').trim();

    if (!propertyId || !kuulaUrl) {
      result.error += 1;
      result.rows.push({ row: rowNumber, propertyId, ok: false, message: 'propertyId y kuulaUrl son requeridos' });
      continue;
    }

    if (!isValidKuulaEmbedUrl(kuulaUrl)) {
      result.error += 1;
      result.rows.push({ row: rowNumber, propertyId, ok: false, message: 'URL de Kuula inválida' });
      continue;
    }

    const exists = await getPropertyById(propertyId);
    if (!exists) {
      result.error += 1;
      result.rows.push({ row: rowNumber, propertyId, ok: false, message: 'Propiedad no encontrada en SIMI' });
      continue;
    }

    await upsertKuulaEmbedUrl(propertyId, normalizeKuulaUrl(kuulaUrl), changedBy);
    result.ok += 1;
    result.rows.push({ row: rowNumber, propertyId, ok: true, message: 'Actualizado' });
  }

  return json({ ok: true, result });
};
