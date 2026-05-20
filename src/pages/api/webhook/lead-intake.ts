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
      idempotencyKey, solicitud_type, tags,
    } = body;

    // Validate required fields
    if (!firstName) return json({ error: 'firstName is required' }, 400);
    if (!phone && !email) return json({ error: 'At least phone or email is required' }, 400);
    if (!source) return json({ error: 'source is required' }, 400);
    if (!pipeline) return json({ error: 'pipeline is required' }, 400);

    // Accept extended pipeline vocabulary for non-commercial leads (services, captación, etc.)
    const VALID_PIPELINES = ['renta', 'compra', 'captacion_venta', 'captacion_renta', 'servicio', 'credito', 'proyecto'];
    if (!VALID_PIPELINES.includes(pipeline)) {
      return json({ error: `pipeline must be one of: ${VALID_PIPELINES.join(', ')}` }, 400);
    }

    // Normalize tags: must be array of uppercase single-word strings
    const normalizedTags: string[] = Array.isArray(tags)
      ? tags.filter((t: unknown): t is string => typeof t === 'string' && t.length > 0)
      : [];

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

    // Route to GHL webhook by solicitud_type — one workflow per type
    const GHL_WEBHOOK_BY_TYPE: Record<string, string | undefined> = {
      'Rentar o Comprar': import.meta.env.GHL_WEBHOOK_RENTAR_COMPRAR
        || 'https://services.leadconnectorhq.com/hooks/8kbdbM2PqR4rZqVDL126/webhook-trigger/278b7b4a-c3be-4fc1-b4b8-5b6fa76f7b7f',
      'Consignar o Avaluar': import.meta.env.GHL_WEBHOOK_CONSIGNAR_AVALUAR
        || 'https://services.leadconnectorhq.com/hooks/8kbdbM2PqR4rZqVDL126/webhook-trigger/Mu73zkbgOPHUQF4xW9Uu',
      'Constructor o Inversionista': import.meta.env.GHL_WEBHOOK_CONSTRUCTOR_INVERSIONISTA
        || 'https://services.leadconnectorhq.com/hooks/8kbdbM2PqR4rZqVDL126/webhook-trigger/o6QQhqdt3PqSns8oOo48',
      'Crédito Exterior': import.meta.env.GHL_WEBHOOK_CREDITO_EXTERIOR
        || 'https://services.leadconnectorhq.com/hooks/8kbdbM2PqR4rZqVDL126/webhook-trigger/MhwT1puagaBJw2UjfpNy',
      'Crédito Hipotecario': import.meta.env.GHL_WEBHOOK_CREDITO_HIPOTECARIO
        || 'https://services.leadconnectorhq.com/hooks/8kbdbM2PqR4rZqVDL126/webhook-trigger/35o65Nju0B37wyEAD8sC',
      'Propietario o Arrendatario': import.meta.env.GHL_WEBHOOK_PROPIETARIO_ARRENDATARIO
        || 'https://services.leadconnectorhq.com/hooks/8kbdbM2PqR4rZqVDL126/webhook-trigger/lDQ7HirZo3G2dylWI4j2',
    };

    const webhookUrl = solicitud_type ? GHL_WEBHOOK_BY_TYPE[solicitud_type] : undefined;

    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName: lastName || '',
            email: email || '',
            phone: phone || '',
            message: notes || `Lead desde portal web - ${pipeline} - ${zone || 'sin zona'}`,
            source: source || 'web-portal',
            sourceLink: sourceLink || '',
            solicitud_type: solicitud_type || '',
            pipeline,
            propertyType: propertyType || '',
            zone: zone || '',
            budgetMin: budgetMin || '',
            budgetMax: budgetMax || '',
            tags: normalizedTags,
            tagsCsv: normalizedTags.join(','),
          }),
        });
      } catch (ghlErr) {
        // Log but don't fail - lead is already saved in our DB
        console.error('GHL webhook forward failed:', ghlErr);
        await db.insert(schema.auditEvents).values({
          entityType: 'lead_case', entityId: leadCase.id,
          action: 'ghl_forward_failed', actor: 'webhook',
          metadata: { error: String(ghlErr), solicitud_type },
        });
      }
    } else {
      // No webhook configured for this solicitud_type — lead saved locally but NOT forwarded to GHL
      await db.insert(schema.auditEvents).values({
        entityType: 'lead_case', entityId: leadCase.id,
        action: 'ghl_forward_skipped', actor: 'webhook',
        metadata: { reason: 'no_webhook_for_solicitud_type', solicitud_type: solicitud_type || null },
      });
    }

    return json({ success: true, contactId, leadCaseId: leadCase.id }, 201);
  } catch (err: any) {
    console.error('lead-intake error:', err);
    return json({ error: 'Internal server error', detail: err.message }, 500);
  }
};
