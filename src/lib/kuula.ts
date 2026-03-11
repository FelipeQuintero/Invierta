import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { db, schema } from '../db';
import { getProperties, getPropertyById } from './simi';

export interface AdminPropertySearchResult {
  id: string;
  title: string;
  city: string;
  neighborhood: string;
  operationType?: string;
  propertyType?: string;
}

export interface KuulaLinkHistoryItem {
  id: string;
  propertyId: string;
  previousKuulaEmbedUrl: string | null;
  newKuulaEmbedUrl: string;
  changedBy: string;
  changedAt: Date;
}

export function normalizeKuulaUrl(value: string): string {
  return value.trim();
}

export function isValidKuulaEmbedUrl(value: string): boolean {
  try {
    const parsed = new URL(normalizeKuulaUrl(value));
    const isHttp = parsed.protocol === 'https:' || parsed.protocol === 'http:';
    const host = parsed.hostname.toLowerCase();
    const isKuulaDomain = host === 'kuula.co' || host === 'www.kuula.co' || host.endsWith('.kuula.co');

    const path = parsed.pathname.toLowerCase();
    const hasAcceptedPath = path.startsWith('/share/') || path.startsWith('/embed/');

    return isHttp && isKuulaDomain && hasAcceptedPath;
  } catch {
    return false;
  }
}

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function getKuulaEmbedUrl(propertyId: string): Promise<string | undefined> {
  if (!hasDatabase() || !propertyId) return undefined;

  const rows = await db
    .select({ kuulaEmbedUrl: schema.propertyKuulaLinks.kuulaEmbedUrl })
    .from(schema.propertyKuulaLinks)
    .where(eq(schema.propertyKuulaLinks.propertyId, propertyId.trim()))
    .limit(1);

  return rows[0]?.kuulaEmbedUrl || undefined;
}

export async function upsertKuulaEmbedUrl(
  propertyId: string,
  kuulaEmbedUrl: string,
  changedBy = 'admin_token'
): Promise<{ previousUrl?: string; currentUrl: string }> {
  if (!hasDatabase()) {
    throw new Error('DATABASE_URL no configurado');
  }

  const normalizedPropertyId = propertyId.trim();
  const normalizedUrl = normalizeKuulaUrl(kuulaEmbedUrl);
  const previousUrl = await getKuulaEmbedUrl(normalizedPropertyId);

  await db
    .insert(schema.propertyKuulaLinks)
    .values({
      propertyId: normalizedPropertyId,
      kuulaEmbedUrl: normalizedUrl,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.propertyKuulaLinks.propertyId,
      set: {
        kuulaEmbedUrl: normalizedUrl,
        updatedAt: new Date(),
      },
    });

  if (previousUrl !== normalizedUrl) {
    await db.insert(schema.propertyKuulaLinkHistory).values({
      propertyId: normalizedPropertyId,
      previousKuulaEmbedUrl: previousUrl || null,
      newKuulaEmbedUrl: normalizedUrl,
      changedBy,
      changedAt: new Date(),
    });
  }

  return { previousUrl, currentUrl: normalizedUrl };
}

export async function getKuulaLinkHistory(options?: {
  propertyId?: string;
  limit?: number;
}): Promise<KuulaLinkHistoryItem[]> {
  if (!hasDatabase()) return [];

  const limit = Math.min(Math.max(options?.limit ?? 30, 1), 200);
  const propertyId = options?.propertyId?.trim();

  const where = propertyId
    ? eq(schema.propertyKuulaLinkHistory.propertyId, propertyId)
    : undefined;

  return db
    .select()
    .from(schema.propertyKuulaLinkHistory)
    .where(where)
    .orderBy(desc(schema.propertyKuulaLinkHistory.changedAt))
    .limit(limit);
}

export async function searchPropertiesForAdmin(query: string, limit = 20): Promise<AdminPropertySearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const normalizedLimit = Math.min(Math.max(limit, 1), 50);

  // 1) Fast-path por código/id exacto
  if (/^[0-9-]{3,}$/.test(trimmed)) {
    const exact = await getPropertyById(trimmed);
    if (exact) {
      return [
        {
          id: exact.id,
          title: exact.title,
          city: exact.city,
          neighborhood: exact.neighborhood,
          operationType: exact.operationType,
          propertyType: exact.propertyType,
        },
      ];
    }
  }

  // 2) Búsqueda en cache de BD (id/ciudad/barrio)
  if (hasDatabase()) {
    const rows = await db
      .select({
        id: schema.simiProperties.id,
        city: schema.simiProperties.city,
        neighborhood: schema.simiProperties.neighborhood,
        operationType: schema.simiProperties.operationType,
        propertyType: schema.simiProperties.propertyType,
        payload: schema.simiProperties.payload,
      })
      .from(schema.simiProperties)
      .where(
        and(
          eq(schema.simiProperties.isActive, true),
          or(
            ilike(schema.simiProperties.id, `%${trimmed}%`),
            ilike(schema.simiProperties.city, `%${trimmed}%`),
            ilike(schema.simiProperties.neighborhood, `%${trimmed}%`)
          )
        )
      )
      .limit(normalizedLimit);

    if (rows.length > 0) {
      return rows.map((row) => {
        const payload = row.payload as { title?: string } | null;
        return {
          id: row.id,
          title: payload?.title || `Propiedad ${row.id}`,
          city: row.city || '',
          neighborhood: row.neighborhood || '',
          operationType: row.operationType || undefined,
          propertyType: row.propertyType || undefined,
        };
      });
    }
  }

  // 3) Fallback usando API existente con locationQuery
  const properties = await getProperties({ locationQuery: trimmed, limit: normalizedLimit });

  return properties.slice(0, normalizedLimit).map((p) => ({
    id: p.id,
    title: p.title,
    city: p.city,
    neighborhood: p.neighborhood,
    operationType: p.operationType,
    propertyType: p.propertyType,
  }));
}
