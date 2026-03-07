CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"actor" varchar(255),
	"before" jsonb,
	"after" jsonb,
	"metadata" jsonb,
	"idempotency_key" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "audit_events_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" varchar(255),
	"simi_id" varchar(100),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"email" varchar(255),
	"phone" varchar(50),
	"whatsapp" varchar(50),
	"type" varchar(50) NOT NULL,
	"source" varchar(100),
	"source_link" text,
	"raw" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"pipeline" varchar(50) NOT NULL,
	"stage" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"property_type" varchar(100),
	"zone" varchar(255),
	"budget_min" integer,
	"budget_max" integer,
	"bedrooms" integer,
	"notes" text,
	"assigned_to" varchar(255),
	"reassigned_count" integer DEFAULT 0,
	"idempotency_key" varchar(255),
	"raw" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp,
	CONSTRAINT "lead_cases_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "sla_timers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_case_id" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"deadline" timestamp NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"notified_at" timestamp,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lead_cases" ADD CONSTRAINT "lead_cases_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sla_timers" ADD CONSTRAINT "sla_timers_lead_case_id_lead_cases_id_fk" FOREIGN KEY ("lead_case_id") REFERENCES "public"."lead_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_events" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "audit_events" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contacts_external_id_idx" ON "contacts" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "contacts_phone_idx" ON "contacts" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "contacts_type_idx" ON "contacts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "lead_cases_contact_idx" ON "lead_cases" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "lead_cases_pipeline_idx" ON "lead_cases" USING btree ("pipeline");--> statement-breakpoint
CREATE INDEX "lead_cases_status_idx" ON "lead_cases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "lead_cases_assigned_idx" ON "lead_cases" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "sla_timers_case_idx" ON "sla_timers" USING btree ("lead_case_id");--> statement-breakpoint
CREATE INDEX "sla_timers_deadline_idx" ON "sla_timers" USING btree ("deadline");--> statement-breakpoint
CREATE INDEX "sla_timers_status_idx" ON "sla_timers" USING btree ("status");