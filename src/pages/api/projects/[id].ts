import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../../db';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

interface UpdateProjectPayload {
  slug?: string;
  name?: string;
  developer?: string;
  description?: string;
  shortDescription?: string;
  city?: string;
  zone?: string;
  neighborhood?: string;
  address?: string;
  coordinates?: unknown;
  constructionStage?: string;
  deliveryDate?: string;
  priceFrom?: number | null;
  priceTo?: number | null;
  amenities?: unknown;
  images?: unknown;
  coverImage?: string;
  videoUrl?: string;
  brochureUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
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
  const id = (params.id || '').trim();
  if (!id) return json({ error: 'id is required' }, 400);

  try {
    const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, id));
    if (!project) return json({ error: 'Project not found' }, 404);

    const typologies = await db
      .select()
      .from(schema.projectTypologies)
      .where(eq(schema.projectTypologies.projectId, id));

    return json({ data: { ...project, typologies } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('project detail error:', error);
    return json({ error: 'Internal server error', detail: message }, 500);
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  if (!isAuthorized(request)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const id = (params.id || '').trim();
  if (!id) return json({ error: 'id is required' }, 400);

  let payload: UpdateProjectPayload;
  try {
    payload = (await request.json()) as UpdateProjectPayload;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  try {
    const [existing] = await db.select().from(schema.projects).where(eq(schema.projects.id, id));
    if (!existing) return json({ error: 'Project not found' }, 404);

    const [updated] = await db
      .update(schema.projects)
      .set({
        slug: payload.slug?.trim() ?? existing.slug,
        name: payload.name?.trim() ?? existing.name,
        developer: payload.developer?.trim() ?? null,
        description: payload.description?.trim() ?? null,
        shortDescription: payload.shortDescription?.trim() ?? null,
        city: payload.city?.trim() ?? existing.city,
        zone: payload.zone?.trim() ?? null,
        neighborhood: payload.neighborhood?.trim() ?? null,
        address: payload.address?.trim() ?? null,
        coordinates: payload.coordinates ?? null,
        constructionStage: payload.constructionStage?.trim() ?? null,
        deliveryDate: payload.deliveryDate?.trim() ?? null,
        priceFrom: payload.priceFrom ?? null,
        priceTo: payload.priceTo ?? null,
        amenities: payload.amenities !== undefined ? toStringArray(payload.amenities) : existing.amenities,
        images: payload.images !== undefined ? toStringArray(payload.images) : existing.images,
        coverImage: payload.coverImage?.trim() ?? null,
        videoUrl: payload.videoUrl?.trim() ?? null,
        brochureUrl: payload.brochureUrl?.trim() ?? null,
        isActive: payload.isActive ?? existing.isActive,
        isFeatured: payload.isFeatured ?? existing.isFeatured,
        updatedAt: new Date(),
      })
      .where(eq(schema.projects.id, id))
      .returning();

    return json({ data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('project update error:', error);
    return json({ error: 'Internal server error', detail: message }, 500);
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  if (!isAuthorized(request)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const id = (params.id || '').trim();
  if (!id) return json({ error: 'id is required' }, 400);

  try {
    const [existing] = await db.select().from(schema.projects).where(eq(schema.projects.id, id));
    if (!existing) return json({ error: 'Project not found' }, 404);

    const [updated] = await db
      .update(schema.projects)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(schema.projects.id, id))
      .returning();

    return json({ data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('project soft delete error:', error);
    return json({ error: 'Internal server error', detail: message }, 500);
  }
};
