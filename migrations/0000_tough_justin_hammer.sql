CREATE TABLE "conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"persona_id" varchar NOT NULL,
	"title" text NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"persona_id" varchar NOT NULL,
	"conversation_id" varchar,
	"message_id" varchar,
	"memory_id" varchar,
	"kind" text NOT NULL,
	"payload" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"persona_id" varchar NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"source" text NOT NULL,
	"salience" real DEFAULT 1 NOT NULL,
	"last_used_at" timestamp,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"tags" text[] DEFAULT '{}'::text[],
	"embedding" jsonb,
	"message_id" varchar,
	"conversation_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"tokens" integer,
	"meta" jsonb DEFAULT '{}'::jsonb,
	"flagged_for_review" boolean DEFAULT false NOT NULL,
	"crisis_level" text,
	"crisis_keywords" text[],
	"intervention_delivered" boolean DEFAULT false NOT NULL,
	"review_status" text DEFAULT 'pending',
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"review_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboarding_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"persona_id" varchar,
	"approach" text NOT NULL,
	"current_step" text NOT NULL,
	"step_data" jsonb DEFAULT '{}'::jsonb,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pattern_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"persona_id" varchar NOT NULL,
	"metric" text NOT NULL,
	"window" text NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "persona_media" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"persona_id" varchar NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mimetype" text NOT NULL,
	"size" text NOT NULL,
	"url" text NOT NULL,
	"media_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"relationship" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"onboarding_approach" text NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"onboarding_data" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "questionnaire_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"persona_id" varchar NOT NULL,
	"current_step" integer DEFAULT 0 NOT NULL,
	"responses" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"display_name" text,
	"preferred_language" text DEFAULT 'en',
	"timezone" text DEFAULT 'UTC',
	"email_notifications" boolean DEFAULT true,
	"push_notifications" boolean DEFAULT true,
	"conversation_notifications" boolean DEFAULT true,
	"weekly_digest" boolean DEFAULT true,
	"data_sharing" boolean DEFAULT false,
	"analytics_opt_in" boolean DEFAULT true,
	"allow_persona_sharing" boolean DEFAULT false,
	"public_profile" boolean DEFAULT false,
	"preferred_model" text DEFAULT 'gpt-3.5-turbo',
	"response_length" text DEFAULT 'medium',
	"conversation_style" text DEFAULT 'balanced',
	"creativity_level" real DEFAULT 0.7,
	"default_persona_visibility" text DEFAULT 'private',
	"default_memory_retention" text DEFAULT 'forever',
	"auto_generate_insights" boolean DEFAULT true,
	"theme" text DEFAULT 'system',
	"compact_mode" boolean DEFAULT false,
	"sidebar_collapsed" boolean DEFAULT false,
	"forbidden_terms" text[] DEFAULT '{}'::text[],
	"language_corrections" jsonb DEFAULT '{}'::jsonb,
	"advanced_settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_memory_id_memories_id_fk" FOREIGN KEY ("memory_id") REFERENCES "public"."memories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_sessions" ADD CONSTRAINT "onboarding_sessions_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pattern_metrics" ADD CONSTRAINT "pattern_metrics_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_media" ADD CONSTRAINT "persona_media_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_progress" ADD CONSTRAINT "questionnaire_progress_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversations_user_persona_status_idx" ON "conversations" USING btree ("user_id","persona_id","status");--> statement-breakpoint
CREATE INDEX "conversations_last_message_idx" ON "conversations" USING btree ("last_message_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "feedback_persona_conversation_idx" ON "feedback" USING btree ("persona_id","conversation_id","message_id");--> statement-breakpoint
CREATE INDEX "memories_persona_idx" ON "memories" USING btree ("persona_id");--> statement-breakpoint
CREATE INDEX "memories_tags_gin_idx" ON "memories" USING btree ("tags");--> statement-breakpoint
CREATE INDEX "messages_conversation_time_idx" ON "messages" USING btree ("conversation_id","created_at","id");--> statement-breakpoint
CREATE INDEX "messages_crisis_review_idx" ON "messages" USING btree ("flagged_for_review","review_status","crisis_level");--> statement-breakpoint
CREATE UNIQUE INDEX "pattern_metrics_persona_metric_window_unique" ON "pattern_metrics" USING btree ("persona_id","metric","window");--> statement-breakpoint
CREATE INDEX "pattern_metrics_persona_idx" ON "pattern_metrics" USING btree ("persona_id");--> statement-breakpoint
CREATE UNIQUE INDEX "questionnaire_progress_user_persona_unique" ON "questionnaire_progress" USING btree ("user_id","persona_id");--> statement-breakpoint
CREATE INDEX "user_settings_user_idx" ON "user_settings" USING btree ("user_id");