import { eq } from 'drizzle-orm';
import { db, schema } from '../db';

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

export async function upsertKuulaEmbedUrl(propertyId: string, kuulaEmbedUrl: string): Promise<void> {
  if (!hasDatabase()) {
    throw new Error('DATABASE_URL no configurado');
  }

  await db
    .insert(schema.propertyKuulaLinks)
    .values({
      propertyId: propertyId.trim(),
      kuulaEmbedUrl: normalizeKuulaUrl(kuulaEmbedUrl),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.propertyKuulaLinks.propertyId,
      set: {
        kuulaEmbedUrl: normalizeKuulaUrl(kuulaEmbedUrl),
        updatedAt: new Date(),
      },
    });
}
