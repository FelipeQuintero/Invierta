import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '../../../../db';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

interface TypologyPayload {
  name?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  price?: number;
  floorPlanImage?: string;
  availableUnits?: number;
  totalUnits?: number;
  features?: unknown;
  sortOrder?: number;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
}

function getBearerToken(request: Request): string {
  const header = request.headers.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer') return '';
  return (token || '').trim();
}

function isAuthorized(request: Request): boolean {
  const envToken = (import.meta.env.ADMIN_TOKEN || '').trim();
  if (!envToken) return false;
  return getBearerToken(request) === envToken;
}

export const GET: APIRoute = async ({ params }) => {
  const projectId = (params.id || '').trim();
  if (!projectId) return json({ error: 'Project id is required' }, 400);

  try {
    const rows = await db
      .select()
      .from(schema.projectTypologies)
      .where(eq(schema.projectTypologies.projectId, projectId));

    return json({ data: rows, count: rows.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('project typologies list error:', error);
    return json({ error: 'Internal server error', detail: message }, 500);
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  if (!isAuthorized(request)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const projectId = (params.id || '').trim();
  if (!projectId) return json({ error: 'Project id is required' }, 400);

  let payload: TypologyPayload;
  try {
    payload = (await request.json()) as TypologyPayload;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const name = (payload.name || '').trim();
  if (!name) return json({ error: 'name is required' }, 400);

  try {
    const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId));
    if (!project) return json({ error: 'Project not found' }, 404);

    const [created] = await db
      .insert(schema.projectTypologies)
      .values({
        projectId,
        name,
        area: payload.area ?? null,
        bedrooms: payload.bedrooms ?? null,
        bathrooms: payload.bathrooms ?? null,
        parking: payload.parking ?? 0,
        price: payload.price ?? null,
        floorPlanImage: payload.floorPlanImage?.trim() || null,
        availableUnits: payload.availableUnits ?? null,
        totalUnits: payload.totalUnits ?? null,
        features: toStringArray(payload.features),
        sortOrder: payload.sortOrder ?? 0,
      })
      .returning();

    return json({ data: created }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('project typology create error:', error);
    return json({ error: 'Internal server error', detail: message }, 500);
  }
};

export const PUT: APIRoute = async ({ params, request, url }) => {
  if (!isAuthorized(request)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const projectId = (params.id || '').trim();
  const typologyId = (url.searchParams.get('typologyId') || '').trim();

  if (!projectId) return json({ error: 'Project id is required' }, 400);
  if (!typologyId) return json({ error: 'typologyId query param is required' }, 400);

  let payload: TypologyPayload;
  try {
    payload = (await request.json()) as TypologyPayload;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  try {
    const [existing] = await db
      .select()
      .from(schema.projectTypologies)
      .where(and(eq(schema.projectTypologies.id, typologyId), eq(schema.projectTypologies.projectId, projectId)));

    if (!existing) return json({ error: 'Typology not found' }, 404);

    const [updated] = await db
      .update(schema.projectTypologies)
      .set({
        name: payload.name?.trim() ?? existing.name,
        area: payload.area ?? existing.area,
        bedrooms: payload.bedrooms ?? existing.bedrooms,
        bathrooms: payload.bathrooms ?? existing.bathrooms,
        parking: payload.parking ?? existing.parking,
        price: payload.price ?? existing.price,
        floorPlanImage: payload.floorPlanImage?.trim() ?? existing.floorPlanImage,
        availableUnits: payload.availableUnits ?? existing.availableUnits,
        totalUnits: payload.totalUnits ?? existing.totalUnits,
        features: payload.features !== undefined ? toStringArray(payload.features) : existing.features,
        sortOrder: payload.sortOrder ?? existing.sortOrder,
        updatedAt: new Date(),
      })
      .where(and(eq(schema.projectTypologies.id, typologyId), eq(schema.projectTypologies.projectId, projectId)))
      .returning();

    return json({ data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('project typology update error:', error);
    return json({ error: 'Internal server error', detail: message }, 500);
  }
};

export const DELETE: APIRoute = async ({ params, request, url }) => {
  if (!isAuthorized(request)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const projectId = (params.id || '').trim();
  const typologyId = (url.searchParams.get('typologyId') || '').trim();

  if (!projectId) return json({ error: 'Project id is required' }, 400);
  if (!typologyId) return json({ error: 'typologyId query param is required' }, 400);

  try {
    const deleted = await db
      .delete(schema.projectTypologies)
      .where(and(eq(schema.projectTypologies.id, typologyId), eq(schema.projectTypologies.projectId, projectId)))
      .returning();

    if (deleted.length === 0) return json({ error: 'Typology not found' }, 404);

    return json({ data: deleted[0] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('project typology delete error:', error);
    return json({ error: 'Internal server error', detail: message }, 500);
  }
};
