import type { APIRoute } from 'astro';
import { db, schema } from '../../../db';
import { eq, sql } from 'drizzle-orm';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { leadCaseId, stage, status, assignedTo, notes, idempotencyKey } = body;

    if (!leadCaseId) return json({ error: 'leadCaseId is required' }, 400);

    // Idempotency check via audit_events
    if (idempotencyKey) {
      const existing = await db.select().from(schema.auditEvents)
        .where(eq(schema.auditEvents.idempotencyKey, idempotencyKey)).limit(1);
      if (existing.length > 0) {
        const [lc] = await db.select().from(schema.leadCases).where(eq(schema.leadCases.id, leadCaseId));
        return json({ success: true, leadCase: lc });
      }
    }

    // Fetch current lead case
    const [current] = await db.select().from(schema.leadCases).where(eq(schema.leadCases.id, leadCaseId));
    if (!current) return json({ error: 'Lead case not found' }, 404);

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (notes !== undefined) updates.notes = notes;

    // Stage change
    if (stage && stage !== current.stage) {
      updates.stage = stage;
      await db.insert(schema.auditEvents).values({
        entityType: 'lead_case', entityId: leadCaseId, action: 'stage_changed', actor: 'webhook',
        before: { stage: current.stage }, after: { stage },
        ...(idempotencyKey && { idempotencyKey: `${idempotencyKey}_stage` }),
      });
    }

    // Assignment change
    if (assignedTo && assignedTo !== current.assignedTo) {
      updates.assignedTo = assignedTo;
      updates.reassignedCount = sql`${schema.leadCases.reassignedCount} + 1`;
      await db.insert(schema.auditEvents).values({
        entityType: 'lead_case', entityId: leadCaseId, action: 'assigned', actor: 'webhook',
        before: { assignedTo: current.assignedTo }, after: { assignedTo },
        ...(idempotencyKey && { idempotencyKey: `${idempotencyKey}_assign` }),
      });
    }

    // Status change
    if (status && status !== current.status) {
      updates.status = status;
      if (status === 'won' || status === 'lost') updates.closedAt = new Date();
    }

    await db.update(schema.leadCases).set(updates).where(eq(schema.leadCases.id, leadCaseId));

    const [updated] = await db.select().from(schema.leadCases).where(eq(schema.leadCases.id, leadCaseId));
    return json({ success: true, leadCase: updated });
  } catch (err: any) {
    console.error('lead-update error:', err);
    return json({ error: 'Internal server error', detail: err.message }, 500);
  }
};
