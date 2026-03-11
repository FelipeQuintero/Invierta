import { and, asc, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm';
import { db, schema } from '../db';
import type { Property, PropertyFilters } from './types';

const enabled = import.meta.env.SIMI_DB_CACHE_ENABLED !== 'false';

function hasDatabase(): boolean {
  return enabled && Boolean(process.env.DATABASE_URL);
}

function toProperty(row: { payload: unknown }): Property {
  return row.payload as Property;
}

export async function getPropertiesFromDb(filters?: PropertyFilters): Promise<Property[] | null> {
  if (!hasDatabase()) return null;

  const conditions = [eq(schema.simiProperties.isActive, true)];

  if (filters?.operation) conditions.push(eq(schema.simiProperties.operationType, filters.operation));
  if (filters?.propertyType) conditions.push(eq(schema.simiProperties.propertyType, filters.propertyType));
  if (filters?.city) conditions.push(ilike(schema.simiProperties.city, `%${filters.city}%`));
  if (filters?.minPrice) conditions.push(gte(schema.simiProperties.price, filters.minPrice));
  if (filters?.maxPrice) conditions.push(lte(schema.simiProperties.price, filters.maxPrice));
  if (filters?.bedrooms) conditions.push(gte(schema.simiProperties.bedrooms, filters.bedrooms));
  if (filters?.bathrooms) conditions.push(gte(schema.simiProperties.bathrooms, filters.bathrooms));
  if (filters?.minArea) conditions.push(gte(schema.simiProperties.area, filters.minArea));
  if (filters?.maxArea) conditions.push(lte(schema.simiProperties.area, filters.maxArea));
  if (filters?.parking) conditions.push(gte(schema.simiProperties.parking, filters.parking));
  if (filters?.stratum) conditions.push(eq(schema.simiProperties.stratum, filters.stratum));
  if (filters?.featured) conditions.push(eq(schema.simiProperties.isFeatured, true));

  const limit = Math.min(Math.max(filters?.limit ?? 200, 1), 1000);
  const offset = Math.max(filters?.offset ?? 0, 0);

  const rows = await db
    .select({ payload: schema.simiProperties.payload })
    .from(schema.simiProperties)
    .where(and(...conditions))
    .orderBy(desc(schema.simiProperties.lastSyncedAt), asc(schema.simiProperties.id))
    .limit(limit)
    .offset(offset);

  if (rows.length === 0) return [];

  let properties = rows.map(toProperty);

  if (filters?.zone) {
    const q = filters.zone.toLowerCase();
    properties = properties.filter((p) => `${p.neighborhood} ${p.location}`.toLowerCase().includes(q));
  }

  if (filters?.query) {
    const q = filters.query.toLowerCase();
    properties = properties.filter((p) => `${p.title} ${p.description} ${p.location}`.toLowerCase().includes(q));
  }

  if (filters?.locationQuery) {
    const q = filters.locationQuery.toLowerCase();
    properties = properties.filter((p) => `${p.city} ${p.neighborhood} ${p.location}`.toLowerCase().includes(q));
  }

  return properties;
}

export async function upsertPropertiesToDb(properties: Property[]): Promise<void> {
  if (!hasDatabase() || properties.length === 0) return;

  const now = new Date();
  const values = properties.map((p) => ({
    id: p.id,
    city: p.city || null,
    zone: p.location || null,
    neighborhood: p.neighborhood || null,
    operationType: p.operationType,
    propertyType: p.propertyType,
    price: p.price || 0,
    area: p.area || 0,
    bedrooms: p.bedrooms || 0,
    bathrooms: p.bathrooms || 0,
    parking: p.parking || 0,
    stratum: p.stratum || 0,
    isFeatured: p.tags?.includes('destacado') || false,
    sourceCreatedAt: p.createdAt ? new Date(p.createdAt) : null,
    sourceUpdatedAt: now,
    lastSyncedAt: now,
    isActive: true,
    payload: p,
  }));

  await db
    .insert(schema.simiProperties)
    .values(values)
    .onConflictDoUpdate({
      target: schema.simiProperties.id,
      set: {
        city: sql`excluded.city`,
        zone: sql`excluded.zone`,
        neighborhood: sql`excluded.neighborhood`,
        operationType: sql`excluded.operation_type`,
        propertyType: sql`excluded.property_type`,
        price: sql`excluded.price`,
        area: sql`excluded.area`,
        bedrooms: sql`excluded.bedrooms`,
        bathrooms: sql`excluded.bathrooms`,
        parking: sql`excluded.parking`,
        stratum: sql`excluded.stratum`,
        isFeatured: sql`excluded.is_featured`,
        sourceCreatedAt: sql`excluded.source_created_at`,
        sourceUpdatedAt: sql`excluded.source_updated_at`,
        lastSyncedAt: sql`excluded.last_synced_at`,
        isActive: sql`excluded.is_active`,
        payload: sql`excluded.payload`,
      },
    });
}

export async function updateSyncState(status: 'running' | 'success' | 'error', message?: string): Promise<void> {
  if (!hasDatabase()) return;

  const baseSet = {
    status,
    message,
    lastAttemptAt: new Date(),
    updatedAt: new Date(),
  };

  await db
    .insert(schema.simiSyncState)
    .values({
      key: 'default',
      ...baseSet,
      lastSuccessAt: status === 'success' ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: schema.simiSyncState.key,
      set: status === 'success' ? { ...baseSet, lastSuccessAt: new Date() } : baseSet,
    });
}
