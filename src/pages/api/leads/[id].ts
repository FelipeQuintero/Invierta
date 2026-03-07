import type { APIRoute } from 'astro';
import { db, schema } from '../../../db';
import { eq, and, desc } from 'drizzle-orm';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) return json({ error: 'ID is required' }, 400);

    const [result] = await db
      .select({ lead: schema.leadCases, contact: schema.contacts })
      .from(schema.leadCases)
      .leftJoin(schema.contacts, eq(schema.leadCases.contactId, schema.contacts.id))
      .where(eq(schema.leadCases.id, id));

    if (!result) return json({ error: 'Lead case not found' }, 404);

    const auditEvents = await db.select().from(schema.auditEvents)
      .where(and(eq(schema.auditEvents.entityType, 'lead_case'), eq(schema.auditEvents.entityId, id)))
      .orderBy(desc(schema.auditEvents.createdAt));

    return json({ ...result, auditEvents });
  } catch (err: any) {
    console.error('lead detail error:', err);
    return json({ error: 'Internal server error', detail: err.message }, 500);
  }
};
