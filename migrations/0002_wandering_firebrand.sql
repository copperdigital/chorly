ALTER TABLE "tasks" ALTER COLUMN "start_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "households" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "households" ADD COLUMN "password_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "due_time";--> statement-breakpoint
ALTER TABLE "households" ADD CONSTRAINT "households_email_unique" UNIQUE("email");