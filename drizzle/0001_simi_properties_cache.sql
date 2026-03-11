CREATE TABLE "simi_properties" (
  "id" varchar(100) PRIMARY KEY NOT NULL,
  "city" varchar(120),
  "zone" varchar(120),
  "neighborhood" varchar(120),
  "operation_type" varchar(20),
  "property_type" varchar(40),
  "price" integer DEFAULT 0 NOT NULL,
  "area" integer DEFAULT 0 NOT NULL,
  "bedrooms" integer DEFAULT 0 NOT NULL,
  "bathrooms" integer DEFAULT 0 NOT NULL,
  "parking" integer DEFAULT 0 NOT NULL,
  "stratum" integer DEFAULT 0 NOT NULL,
  "is_featured" boolean DEFAULT false NOT NULL,
  "source_created_at" timestamp,
  "source_updated_at" timestamp DEFAULT now() NOT NULL,
  "last_synced_at" timestamp DEFAULT now() NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "payload" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "simi_properties_city_idx" ON "simi_properties" USING btree ("city");
--> statement-breakpoint
CREATE INDEX "simi_properties_operation_idx" ON "simi_properties" USING btree ("operation_type");
--> statement-breakpoint
CREATE INDEX "simi_properties_property_type_idx" ON "simi_properties" USING btree ("property_type");
--> statement-breakpoint
CREATE INDEX "simi_properties_price_idx" ON "simi_properties" USING btree ("price");
--> statement-breakpoint
CREATE INDEX "simi_properties_last_synced_idx" ON "simi_properties" USING btree ("last_synced_at");
--> statement-breakpoint
CREATE INDEX "simi_properties_is_active_idx" ON "simi_properties" USING btree ("is_active");
--> statement-breakpoint

CREATE TABLE "simi_sync_state" (
  "key" varchar(50) PRIMARY KEY DEFAULT 'default' NOT NULL,
  "last_success_at" timestamp,
  "last_attempt_at" timestamp DEFAULT now() NOT NULL,
  "status" varchar(20) DEFAULT 'idle' NOT NULL,
  "message" text,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
