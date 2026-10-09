import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db';
import { SERVICES, LEGAL_LINKS } from '../lib/constants';

// Sitemap dinámico: se genera en cada solicitud con las propiedades activas
// (sincronizadas desde SIMI) y los proyectos activos de la base de datos.
// Lo usan Google y el web crawler de la Knowledge Base de GoHighLevel.
export const prerender = false;

const SITE_URL = (import.meta.env.SITE_URL || 'https://www.invierta.com.co').replace(/\/+$/, '');

// Páginas fijas del sitio
const STATIC_PATHS = [
  '/',
  '/propiedades',
  '/proyectos',
  '/servicios',
  ...SERVICES.map((service) => `/servicios/${service.slug}`),
  '/publica',
  '/publica/venta',
  '/publica/arriendo',
  '/referidos',
  ...LEGAL_LINKS.map((link) => link.href),
];

interface SitemapEntry {
  loc: string;
  lastmod?: Date | null;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

function toLastmod(date?: Date | null): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

async function getPropertyEntries(): Promise<SitemapEntry[]> {
  try {
    const rows = await db
      .select({ id: schema.simiProperties.id, updatedAt: schema.simiProperties.sourceUpdatedAt })
      .from(schema.simiProperties)
      .where(eq(schema.simiProperties.isActive, true));

    return rows.map((row) => ({
      loc: toUrl(`/propiedad/${encodeURIComponent(row.id)}`),
      lastmod: row.updatedAt,
    }));
  } catch (error) {
    console.error('[sitemap] Error cargando propiedades:', error);
    return [];
  }
}

async function getProjectEntries(): Promise<SitemapEntry[]> {
  try {
    const rows = await db
      .select({ slug: schema.projects.slug, updatedAt: schema.projects.updatedAt })
      .from(schema.projects)
      .where(eq(schema.projects.isActive, true));

    return rows.map((row) => ({
      loc: toUrl(`/proyecto/${encodeURIComponent(row.slug)}`),
      lastmod: row.updatedAt,
    }));
  } catch (error) {
    console.error('[sitemap] Error cargando proyectos:', error);
    return [];
  }
}

export const GET: APIRoute = async () => {
  const [properties, projects] = await Promise.all([getPropertyEntries(), getProjectEntries()]);

  const entries: SitemapEntry[] = [
    ...STATIC_PATHS.map((path) => ({ loc: toUrl(path) })),
    ...projects,
    ...properties,
  ];

  const urls = entries
    .map((entry) => {
      const lastmod = toLastmod(entry.lastmod);
      return [
        '  <url>',
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
