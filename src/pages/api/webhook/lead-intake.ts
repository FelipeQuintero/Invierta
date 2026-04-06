import type { APIRoute } from 'astro';
import { db, schema } from '../../../db';
import { eq, or } from 'drizzle-orm';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      firstName, lastName, email, phone, whatsapp,
      source, sourceLink, pipeline, propertyType,
      zone, budgetMin, budgetMax, bedrooms, notes,
      idempotencyKey, solicitud_type,
    } = body;

    // Validate required fields
    if (!firstName) return json({ error: 'firstName is required' }, 400);
    if (!phone && !email) return json({ error: 'At least phone or email is required' }, 400);
    if (!source) return json({ error: 'source is required' }, 400);
    if (!pipeline) return json({ error: 'pipeline is required' }, 400);
    if (!['renta', 'compra'].includes(pipeline)) return json({ error: 'pipeline must be renta or compra' }, 400);

    // Idempotency check
    if (idempotencyKey) {
      const existing = await db.select().from(schema.leadCases).where(eq(schema.leadCases.idempotencyKey, idempotencyKey)).limit(1);
      if (existing.length > 0) {
        return json({ success: true, contactId: existing[0].contactId, leadCaseId: existing[0].id });
      }
    }

    // Find or create contact
    const conditions = [];
    if (phone) conditions.push(eq(schema.contacts.phone, phone));
    if (email) conditions.push(eq(schema.contacts.email, email));

    const existingContacts = conditions.length > 0
      ? await db.select().from(schema.contacts).where(or(...conditions)).limit(1)
      : [];

    let contactId: string;
    let contactAction: 'created' | 'updated';

    if (existingContacts.length > 0) {
      contactId = existingContacts[0].id;
      contactAction = 'updated';
      await db.update(schema.contacts).set({
        firstName, lastName,
        ...(email && { email }),
        ...(phone && { phone }),
        ...(whatsapp && { whatsapp }),
        source, sourceLink,
        updatedAt: new Date(),
      }).where(eq(schema.contacts.id, contactId));
    } else {
      const [newContact] = await db.insert(schema.contacts).values({
        firstName, lastName, email, phone, whatsapp,
        type: 'lead', source, sourceLink,
      }).returning({ id: schema.contacts.id });
      contactId = newContact.id;
      contactAction = 'created';
    }

    // Create lead_case
    const [leadCase] = await db.insert(schema.leadCases).values({
      contactId,
      pipeline, stage: 'nuevo', status: 'open',
      propertyType, zone, budgetMin, budgetMax, bedrooms, notes,
      idempotencyKey: idempotencyKey || undefined,
      raw: body,
    }).returning({ id: schema.leadCases.id });

    // Audit events
    await db.insert(schema.auditEvents).values([
      { entityType: 'contact', entityId: contactId, action: contactAction, actor: 'webhook' },
      { entityType: 'lead_case', entityId: leadCase.id, action: 'created', actor: 'webhook' },
    ]);

    // SLA timer - first contact within 24h
    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.insert(schema.slaTimers).values({
      leadCaseId: leadCase.id, type: 'first_contact', deadline,
    });

    // Forward to Lucra (GHL) inbound webhook
    const LUCRA_WEBHOOK_URL = import.meta.env.LUCRA_WEBHOOK_URL
      || 'https://services.leadconnectorhq.com/hooks/8kbdbM2PqR4rZqVDL126/webhook-trigger/a380a512-3b67-4cc6-b639-86d3aacfdccf';

    try {
      await fetch(LUCRA_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName: lastName || '',
          email: email || '',
          phone: phone || '',
          message: notes || `Lead desde portal web - ${pipeline} - ${zone || 'sin zona'}`,
          source: source || 'web-portal',
          solicitud_type: solicitud_type || '',
          pipeline,
          propertyType: propertyType || '',
          zone: zone || '',
          budgetMin: budgetMin || '',
          budgetMax: budgetMax || '',
        }),
      });
    } catch (lucraErr) {
      // Log but don't fail - lead is already saved in our DB
      console.error('Lucra webhook forward failed:', lucraErr);
      await db.insert(schema.auditEvents).values({
        entityType: 'lead_case', entityId: leadCase.id,
        action: 'lucra_forward_failed', actor: 'webhook',
        metadata: { error: String(lucraErr) },
      });
    }

    return json({ success: true, contactId, leadCaseId: leadCase.id }, 201);
  } catch (err: any) {
    console.error('lead-intake error:', err);
    return json({ error: 'Internal server error', detail: err.message }, 500);
  }
};
