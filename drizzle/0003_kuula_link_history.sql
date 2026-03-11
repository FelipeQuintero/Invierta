CREATE TABLE IF NOT EXISTS "property_kuula_link_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "property_id" varchar(100) NOT NULL,
  "previous_kuula_embed_url" text,
  "new_kuula_embed_url" text NOT NULL,
  "changed_by" varchar(255) DEFAULT 'admin_token' NOT NULL,
  "changed_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "property_kuula_link_history_property_id_idx"
  ON "property_kuula_link_history" ("property_id");

CREATE INDEX IF NOT EXISTS "property_kuula_link_history_changed_at_idx"
  ON "property_kuula_link_history" ("changed_at");
