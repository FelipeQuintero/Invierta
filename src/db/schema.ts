import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, boolean, index } from 'drizzle-orm/pg-core';

// ============================================
// FASE 0A — Esquema canónico base
// ============================================

/**
 * Contactos — registro maestro de personas (leads, propietarios, arrendatarios, asesores)
 */
export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  externalId: varchar('external_id', { length: 255 }), // ID en Lucra/GHL
  simiId: varchar('simi_id', { length: 100 }),          // ID en SIMI (si existe)
  
  // Datos básicos
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  whatsapp: varchar('whatsapp', { length: 50 }),
  
  // Clasificación
  type: varchar('type', { length: 50 }).notNull(), // lead, propietario, arrendatario, asesor
  source: varchar('source', { length: 100 }),       // web, finca-raiz, metro-cuadrado, 100-cuadras, whatsapp, referido
  sourceLink: text('source_link'),                  // URL de origen
  
  // Metadata
  raw: jsonb('raw'),                                // payload original sin procesar
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('contacts_external_id_idx').on(table.externalId),
  index('contacts_phone_idx').on(table.phone),
  index('contacts_type_idx').on(table.type),
]);

/**
 * LeadCases — caso/oportunidad de negocio vinculado a un contacto
 */
export const leadCases = pgTable('lead_cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  contactId: uuid('contact_id').references(() => contacts.id).notNull(),
  
  // Clasificación
  pipeline: varchar('pipeline', { length: 50 }).notNull(),  // renta, compra
  stage: varchar('stage', { length: 100 }).notNull(),        // etapa actual del pipeline
  status: varchar('status', { length: 50 }).notNull().default('open'), // open, won, lost, stale
  
  // Detalles del caso
  propertyType: varchar('property_type', { length: 100 }),   // apartamento, casa, etc.
  zone: varchar('zone', { length: 255 }),
  budgetMin: integer('budget_min'),
  budgetMax: integer('budget_max'),
  bedrooms: integer('bedrooms'),
  notes: text('notes'),
  
  // Asignación
  assignedTo: varchar('assigned_to', { length: 255 }),       // asesor asignado
  reassignedCount: integer('reassigned_count').default(0),
  
  // Idempotencia
  idempotencyKey: varchar('idempotency_key', { length: 255 }).unique(),
  
  // Metadata
  raw: jsonb('raw'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
}, (table) => [
  index('lead_cases_contact_idx').on(table.contactId),
  index('lead_cases_pipeline_idx').on(table.pipeline),
  index('lead_cases_status_idx').on(table.status),
  index('lead_cases_assigned_idx').on(table.assignedTo),
]);

/**
 * SLA Timers — temporizadores de cumplimiento por caso
 */
export const slaTimers = pgTable('sla_timers', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadCaseId: uuid('lead_case_id').references(() => leadCases.id).notNull(),
  
  type: varchar('type', { length: 100 }).notNull(),   // first_contact, reassignment, contract_draft, repair
  deadline: timestamp('deadline').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, met, breached, cancelled
  
  notifiedAt: timestamp('notified_at'),
  resolvedAt: timestamp('resolved_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('sla_timers_case_idx').on(table.leadCaseId),
  index('sla_timers_deadline_idx').on(table.deadline),
  index('sla_timers_status_idx').on(table.status),
]);

/**
 * Audit Events — trazabilidad completa de todo lo que pasa
 */
export const auditEvents = pgTable('audit_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Referencia al recurso
  entityType: varchar('entity_type', { length: 50 }).notNull(), // contact, lead_case, sla_timer
  entityId: uuid('entity_id').notNull(),
  
  // Evento
  action: varchar('action', { length: 100 }).notNull(), // created, updated, stage_changed, assigned, sla_breached, etc.
  actor: varchar('actor', { length: 255 }),              // sistema, usuario, webhook
  
  // Datos del cambio
  before: jsonb('before'),
  after: jsonb('after'),
  metadata: jsonb('metadata'),                           // info extra (IP, source, etc.)
  
  // Idempotencia
  idempotencyKey: varchar('idempotency_key', { length: 255 }).unique(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('audit_entity_idx').on(table.entityType, table.entityId),
  index('audit_action_idx').on(table.action),
  index('audit_created_idx').on(table.createdAt),
]);

/**
 * SIMI properties cache persisted in Postgres for fast reads.
 */
export const simiProperties = pgTable('simi_properties', {
  id: varchar('id', { length: 100 }).primaryKey(), // Codigo_Inmueble
  city: varchar('city', { length: 120 }),
  zone: varchar('zone', { length: 120 }),
  neighborhood: varchar('neighborhood', { length: 120 }),
  operationType: varchar('operation_type', { length: 20 }),
  propertyType: varchar('property_type', { length: 40 }),
  price: integer('price').default(0).notNull(),
  area: integer('area').default(0).notNull(),
  bedrooms: integer('bedrooms').default(0).notNull(),
  bathrooms: integer('bathrooms').default(0).notNull(),
  parking: integer('parking').default(0).notNull(),
  stratum: integer('stratum').default(0).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  sourceCreatedAt: timestamp('source_created_at'),
  sourceUpdatedAt: timestamp('source_updated_at').defaultNow().notNull(),
  lastSyncedAt: timestamp('last_synced_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  payload: jsonb('payload').notNull(),
}, (table) => [
  index('simi_properties_city_idx').on(table.city),
  index('simi_properties_operation_idx').on(table.operationType),
  index('simi_properties_property_type_idx').on(table.propertyType),
  index('simi_properties_price_idx').on(table.price),
  index('simi_properties_last_synced_idx').on(table.lastSyncedAt),
  index('simi_properties_is_active_idx').on(table.isActive),
]);

/**
 * Control table for manual/cron sync runs.
 */
export const simiSyncState = pgTable('simi_sync_state', {
  key: varchar('key', { length: 50 }).primaryKey().default('default'),
  lastSuccessAt: timestamp('last_success_at'),
  lastAttemptAt: timestamp('last_attempt_at').defaultNow().notNull(),
  status: varchar('status', { length: 20 }).default('idle').notNull(), // idle, running, success, error
  message: text('message'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Proyectos inmobiliarios administrados manualmente (no SIMI).
 */
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  developer: varchar('developer', { length: 255 }),
  description: text('description'),
  shortDescription: text('short_description'),
  city: varchar('city', { length: 120 }).notNull(),
  zone: varchar('zone', { length: 120 }),
  neighborhood: varchar('neighborhood', { length: 120 }),
  address: varchar('address', { length: 255 }),
  coordinates: jsonb('coordinates'),
  constructionStage: varchar('construction_stage', { length: 50 }),
  deliveryDate: varchar('delivery_date', { length: 100 }),
  priceFrom: integer('price_from'),
  priceTo: integer('price_to'),
  amenities: jsonb('amenities'),
  images: jsonb('images'),
  coverImage: text('cover_image'),
  videoUrl: text('video_url'),
  brochureUrl: text('brochure_url'),
  isActive: boolean('is_active').notNull().default(true),
  isFeatured: boolean('is_featured').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('projects_city_idx').on(table.city),
  index('projects_construction_stage_idx').on(table.constructionStage),
  index('projects_is_active_idx').on(table.isActive),
  index('projects_is_featured_idx').on(table.isFeatured),
]);

/**
 * Tipologías disponibles por proyecto.
 */
export const projectTypologies = pgTable('project_typologies', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  area: integer('area'),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  parking: integer('parking').notNull().default(0),
  price: integer('price'),
  floorPlanImage: text('floor_plan_image'),
  availableUnits: integer('available_units'),
  totalUnits: integer('total_units'),
  features: jsonb('features'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('project_typologies_project_id_idx').on(table.projectId),
]);
