CREATE TABLE "project_typologies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"area" integer,
	"bedrooms" integer,
	"bathrooms" integer,
	"parking" integer DEFAULT 0 NOT NULL,
	"price" integer,
	"floor_plan_image" text,
	"available_units" integer,
	"total_units" integer,
	"features" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"developer" varchar(255),
	"description" text,
	"short_description" text,
	"city" varchar(120) NOT NULL,
	"zone" varchar(120),
	"neighborhood" varchar(120),
	"address" varchar(255),
	"coordinates" jsonb,
	"construction_stage" varchar(50),
	"delivery_date" varchar(100),
	"price_from" integer,
	"price_to" integer,
	"amenities" jsonb,
	"images" jsonb,
	"cover_image" text,
	"video_url" text,
	"brochure_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "project_typologies" ADD CONSTRAINT "project_typologies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_typologies_project_id_idx" ON "project_typologies" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "projects_city_idx" ON "projects" USING btree ("city");--> statement-breakpoint
CREATE INDEX "projects_construction_stage_idx" ON "projects" USING btree ("construction_stage");--> statement-breakpoint
CREATE INDEX "projects_is_active_idx" ON "projects" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "projects_is_featured_idx" ON "projects" USING btree ("is_featured");