CREATE TABLE "notification_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"update_check_id" uuid NOT NULL,
	"subscriber_emails" text[] NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"verified_at" timestamp,
	"verification_token" text,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "update_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"check_timestamp" timestamp DEFAULT now() NOT NULL,
	"content_hash" text NOT NULL,
	"has_changed" boolean DEFAULT false NOT NULL,
	"change_details" text
);
--> statement-breakpoint
CREATE TABLE "update_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"update_check_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"publish_date" timestamp,
	"url" text,
	"is_new" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_update_check_id_update_checks_id_fk" FOREIGN KEY ("update_check_id") REFERENCES "public"."update_checks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "update_content" ADD CONSTRAINT "update_content_update_check_id_update_checks_id_fk" FOREIGN KEY ("update_check_id") REFERENCES "public"."update_checks"("id") ON DELETE no action ON UPDATE no action;