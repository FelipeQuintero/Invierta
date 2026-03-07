import type { APIRoute } from 'astro';
import { db, schema } from '../../../db';
import { eq, and, desc, sql } from 'drizzle-orm';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

/**
 * Handles two types of requests:
 * 1. Direct updates: { leadCaseId, stage, status, assignedTo, ... }
 * 2. GHL webhook events: { event, contactPhone, contactName, pipeline, stage, motivo, ... }
 *
 * GHL events:
 *   - new_lead_whatsapp: New lead from WhatsApp (D5)
 *   - sla_breach: Asesor didn't contact within 24h (D5)
 *   - first_contact_made: Asesor contacted in time (D5)
 *   - contact_classified: Contact classified by Valeria (D9)
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Route: GHL webhook event
    if (body.event) {
      return handleGhlEvent(body);
    }

    // Route: Direct lead case update (existing behavior)
    return handleDirectUpdate(body);
  } catch (err: any) {
    console.error('lead-update error:', err);
    return json({ error: 'Internal server error', detail: err.message }, 500);
  }
};

// ─── GHL Webhook Events ────────────────────────────────────────────

async function handleGhlEvent(body: any) {
  const { event, contactPhone, contactName, pipeline, stage, motivo } = body;

  if (!event) return json({ error: 'event is required' }, 400);
  if (!contactPhone && !contactName) return json({ error: 'contactPhone or contactName required' }, 400);

  // Find contact by phone
  let contact = contactPhone
    ? (await db.select().from(schema.contacts).where(eq(schema.contacts.phone, contactPhone)).limit(1))[0]
    : null;

  // If not found, create a minimal contact record
  if (!contact) {
    const nameParts = (contactName || 'Desconocido').split(' ');
    const [newContact] = await db.insert(schema.contacts).values({
      firstName: nameParts[0] || 'Desconocido',
      lastName: nameParts.slice(1).join(' ') || '',
      phone: contactPhone || null,
      type: 'lead',
      source: 'lucra',
    }).returning();
    contact = newContact;

    await db.insert(schema.auditEvents).values({
      entityType: 'contact', entityId: contact.id,
      action: 'created', actor: 'ghl-webhook',
      metadata: { event, source: 'auto-created from GHL webhook' },
    });
  }

  switch (event) {
    case 'new_lead_whatsapp':
      return handleNewLeadWhatsapp(contact, body);
    case 'sla_breach':
      return handleSlaBreach(contact, body);
    case 'first_contact_made':
      return handleFirstContact(contact, body);
    case 'contact_classified':
      return handleContactClassified(contact, body);
    default:
      // Log unknown events for future expansion
      await db.insert(schema.auditEvents).values({
        entityType: 'contact', entityId: contact.id,
        action: 'unknown_ghl_event', actor: 'ghl-webhook',
        metadata: body,
      });
      return json({ success: true, warning: `Unknown event: ${event}` });
  }
}

async function handleNewLeadWhatsapp(contact: any, body: any) {
  // Check if there's already an open lead case for this contact
  const existing = await db.select().from(schema.leadCases)
    .where(and(eq(schema.leadCases.contactId, contact.id), eq(schema.leadCases.status, 'open')))
    .orderBy(desc(schema.leadCases.createdAt)).limit(1);

  if (existing.length > 0) {
    // Already has an open case — just log the event
    await db.insert(schema.auditEvents).values({
      entityType: 'lead_case', entityId: existing[0].id,
      action: 'whatsapp_reply_duplicate', actor: 'ghl-webhook',
      metadata: body,
    });
    return json({ success: true, leadCaseId: existing[0].id, note: 'existing open case' });
  }

  // Create new lead case
  const [leadCase] = await db.insert(schema.leadCases).values({
    contactId: contact.id,
    pipeline: body.pipeline || 'comercial',
    stage: 'nuevo',
    status: 'open',
    raw: body,
  }).returning();

  await db.insert(schema.auditEvents).values({
    entityType: 'lead_case', entityId: leadCase.id,
    action: 'created', actor: 'ghl-webhook',
    metadata: { event: 'new_lead_whatsapp', source: 'whatsapp' },
  });

  // SLA: first contact within 24h
  const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.insert(schema.slaTimers).values({
    leadCaseId: leadCase.id, type: 'first_contact', deadline,
  });

  return json({ success: true, contactId: contact.id, leadCaseId: leadCase.id }, 201);
}

async function handleSlaBreach(contact: any, body: any) {
  // Find the most recent open lead case for this contact
  const [leadCase] = await db.select().from(schema.leadCases)
    .where(and(eq(schema.leadCases.contactId, contact.id), eq(schema.leadCases.status, 'open')))
    .orderBy(desc(schema.leadCases.createdAt)).limit(1);

  if (!leadCase) {
    return json({ success: true, warning: 'No open lead case found for SLA breach' });
  }

  // Mark SLA as breached
  await db.update(schema.slaTimers).set({
    status: 'breached', resolvedAt: new Date(),
  }).where(and(
    eq(schema.slaTimers.leadCaseId, leadCase.id),
    eq(schema.slaTimers.type, 'first_contact'),
  ));

  await db.insert(schema.auditEvents).values({
    entityType: 'lead_case', entityId: leadCase.id,
    action: 'sla_breached', actor: 'ghl-webhook',
    metadata: { type: 'first_contact_24h', pipeline: body.pipeline, stage: body.stage },
  });

  return json({ success: true, leadCaseId: leadCase.id, slaBreach: true });
}

async function handleFirstContact(contact: any, body: any) {
  const [leadCase] = await db.select().from(schema.leadCases)
    .where(and(eq(schema.leadCases.contactId, contact.id), eq(schema.leadCases.status, 'open')))
    .orderBy(desc(schema.leadCases.createdAt)).limit(1);

  if (!leadCase) {
    return json({ success: true, warning: 'No open lead case found' });
  }

  // Update stage
  await db.update(schema.leadCases).set({
    stage: 'en_comunicacion', updatedAt: new Date(),
  }).where(eq(schema.leadCases.id, leadCase.id));

  // Mark SLA as met
  await db.update(schema.slaTimers).set({
    status: 'met', resolvedAt: new Date(),
  }).where(and(
    eq(schema.slaTimers.leadCaseId, leadCase.id),
    eq(schema.slaTimers.type, 'first_contact'),
  ));

  await db.insert(schema.auditEvents).values({
    entityType: 'lead_case', entityId: leadCase.id,
    action: 'first_contact_made', actor: 'ghl-webhook',
    metadata: { pipeline: body.pipeline },
  });

  return json({ success: true, leadCaseId: leadCase.id, slaStatus: 'met' });
}

async function handleContactClassified(contact: any, body: any) {
  const { motivo, pipeline } = body;

  // Log classification
  await db.insert(schema.auditEvents).values({
    entityType: 'contact', entityId: contact.id,
    action: 'classified', actor: 'ghl-webhook',
    metadata: { motivo, pipeline },
  });

  // Update contact source info
  await db.update(schema.contacts).set({
    source: `lucra-${motivo || 'unknown'}`,
    updatedAt: new Date(),
  }).where(eq(schema.contacts.id, contact.id));

  // If motivo is rentar_comprar, find/create a lead case in comercial pipeline
  if (motivo === 'rentar_comprar') {
    const existing = await db.select().from(schema.leadCases)
      .where(and(eq(schema.leadCases.contactId, contact.id), eq(schema.leadCases.status, 'open')))
      .orderBy(desc(schema.leadCases.createdAt)).limit(1);

    if (existing.length === 0) {
      const [leadCase] = await db.insert(schema.leadCases).values({
        contactId: contact.id,
        pipeline: 'comercial', stage: 'nuevo', status: 'open',
        raw: body,
      }).returning();

      await db.insert(schema.auditEvents).values({
        entityType: 'lead_case', entityId: leadCase.id,
        action: 'created', actor: 'ghl-webhook',
        metadata: { event: 'contact_classified', motivo },
      });

      return json({ success: true, contactId: contact.id, leadCaseId: leadCase.id }, 201);
    }
  }

  return json({ success: true, contactId: contact.id, motivo, pipeline });
}

// ─── Direct Lead Case Updates ──────────────────────────────────────

async function handleDirectUpdate(body: any) {
  const { leadCaseId, stage, status, assignedTo, notes, idempotencyKey } = body;

  if (!leadCaseId) return json({ error: 'leadCaseId is required' }, 400);

  // Idempotency check
  if (idempotencyKey) {
    const existing = await db.select().from(schema.auditEvents)
      .where(eq(schema.auditEvents.idempotencyKey, idempotencyKey)).limit(1);
    if (existing.length > 0) {
      const [lc] = await db.select().from(schema.leadCases).where(eq(schema.leadCases.id, leadCaseId));
      return json({ success: true, leadCase: lc });
    }
  }

  const [current] = await db.select().from(schema.leadCases).where(eq(schema.leadCases.id, leadCaseId));
  if (!current) return json({ error: 'Lead case not found' }, 404);

  const updates: Record<string, any> = { updatedAt: new Date() };
  if (notes !== undefined) updates.notes = notes;

  if (stage && stage !== current.stage) {
    updates.stage = stage;
    await db.insert(schema.auditEvents).values({
      entityType: 'lead_case', entityId: leadCaseId, action: 'stage_changed', actor: 'webhook',
      before: { stage: current.stage }, after: { stage },
      ...(idempotencyKey && { idempotencyKey: `${idempotencyKey}_stage` }),
    });
  }

  if (assignedTo && assignedTo !== current.assignedTo) {
    updates.assignedTo = assignedTo;
    updates.reassignedCount = sql`${schema.leadCases.reassignedCount} + 1`;
    await db.insert(schema.auditEvents).values({
      entityType: 'lead_case', entityId: leadCaseId, action: 'assigned', actor: 'webhook',
      before: { assignedTo: current.assignedTo }, after: { assignedTo },
      ...(idempotencyKey && { idempotencyKey: `${idempotencyKey}_assign` }),
    });
  }

  if (status && status !== current.status) {
    updates.status = status;
    if (status === 'won' || status === 'lost') updates.closedAt = new Date();
  }

  await db.update(schema.leadCases).set(updates).where(eq(schema.leadCases.id, leadCaseId));
  const [updated] = await db.select().from(schema.leadCases).where(eq(schema.leadCases.id, leadCaseId));
  return json({ success: true, leadCase: updated });
}
