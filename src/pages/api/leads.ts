import type { APIRoute } from 'astro';
import { db, schema } from '../../db';
import { eq, and, desc, sql, count } from 'drizzle-orm';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async ({ url }) => {
  try {
    const pipeline = url.searchParams.get('pipeline');
    const status = url.searchParams.get('status');
    const assignedTo = url.searchParams.get('assignedTo');
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (pipeline) conditions.push(eq(schema.leadCases.pipeline, pipeline));
    if (status) conditions.push(eq(schema.leadCases.status, status));
    if (assignedTo) conditions.push(eq(schema.leadCases.assignedTo, assignedTo));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db.select({ total: count() }).from(schema.leadCases).where(where);

    const leads = await db
      .select({
        lead: schema.leadCases,
        contact: schema.contacts,
      })
      .from(schema.leadCases)
      .leftJoin(schema.contacts, eq(schema.leadCases.contactId, schema.contacts.id))
      .where(where)
      .orderBy(desc(schema.leadCases.createdAt))
      .limit(limit)
      .offset(offset);

    return json({
      data: leads,
      pagination: { page, limit, total: totalResult.total, pages: Math.ceil(totalResult.total / limit) },
    });
  } catch (err: any) {
    console.error('leads list error:', err);
    return json({ error: 'Internal server error', detail: err.message }, 500);
  }
};
