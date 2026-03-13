import type { APIRoute } from 'astro';
import { and, desc, eq } from 'drizzle-orm';
import { db, schema } from '../../../db';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

interface CreateProjectPayload {
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
  priceFrom?: number;
  priceTo?: number;
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

export const GET: APIRoute = async ({ url }) => {
  try {
    const city = (url.searchParams.get('city') || '').trim();
    const stage = (url.searchParams.get('stage') || '').trim();
    const featuredParam = (url.searchParams.get('featured') || '').trim().toLowerCase();

    const conditions = [eq(schema.projects.isActive, true)];

    if (city) conditions.push(eq(schema.projects.city, city));
    if (stage) conditions.push(eq(schema.projects.constructionStage, stage));
    if (featuredParam === 'true') conditions.push(eq(schema.projects.isFeatured, true));
    if (featuredParam === 'false') conditions.push(eq(schema.projects.isFeatured, false));

    const projects = await db
      .select()
      .from(schema.projects)
      .where(and(...conditions))
      .orderBy(desc(schema.projects.createdAt));

    return json({ data: projects, count: projects.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('projects list error:', error);
    return json({ error: 'Internal server error', detail: message }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthorized(request)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let payload: CreateProjectPayload;
  try {
    payload = (await request.json()) as CreateProjectPayload;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const slug = (payload.slug || '').trim();
  const name = (payload.name || '').trim();
  const city = (payload.city || '').trim();

  if (!slug || !name || !city) {
    return json({ error: 'slug, name and city are required' }, 400);
  }

  try {
    const [created] = await db
      .insert(schema.projects)
      .values({
        slug,
        name,
        developer: payload.developer?.trim() || null,
        description: payload.description?.trim() || null,
        shortDescription: payload.shortDescription?.trim() || null,
        city,
        zone: payload.zone?.trim() || null,
        neighborhood: payload.neighborhood?.trim() || null,
        address: payload.address?.trim() || null,
        coordinates: payload.coordinates ?? null,
        constructionStage: payload.constructionStage?.trim() || null,
        deliveryDate: payload.deliveryDate?.trim() || null,
        priceFrom: payload.priceFrom ?? null,
        priceTo: payload.priceTo ?? null,
        amenities: toStringArray(payload.amenities),
        images: toStringArray(payload.images),
        coverImage: payload.coverImage?.trim() || null,
        videoUrl: payload.videoUrl?.trim() || null,
        brochureUrl: payload.brochureUrl?.trim() || null,
        isActive: payload.isActive ?? true,
        isFeatured: payload.isFeatured ?? false,
      })
      .returning();

    return json({ data: created }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('projects create error:', error);
    return json({ error: 'Internal server error', detail: message }, 500);
  }
};
