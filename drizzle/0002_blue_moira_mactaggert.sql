CREATE TABLE "property_kuula_links" (
	"property_id" varchar(100) PRIMARY KEY NOT NULL,
	"kuula_embed_url" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "property_kuula_links_updated_at_idx" ON "property_kuula_links" USING btree ("updated_at");