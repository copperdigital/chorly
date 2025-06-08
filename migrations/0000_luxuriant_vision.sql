CREATE TABLE "black_marks" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" integer NOT NULL,
	"task_instance_id" integer NOT NULL,
	"missed_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "households" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "households_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" serial PRIMARY KEY NOT NULL,
	"household_id" integer NOT NULL,
	"nickname" text NOT NULL,
	"pin" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"avatar" text DEFAULT 'default' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reward_claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"reward_id" integer NOT NULL,
	"person_id" integer NOT NULL,
	"claimed_at" timestamp NOT NULL,
	"points_spent" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"household_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"points_cost" integer NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_instances" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"assigned_to" integer NOT NULL,
	"is_secondary" boolean DEFAULT false NOT NULL,
	"due_date" timestamp NOT NULL,
	"completed_at" timestamp,
	"is_completed" boolean DEFAULT false NOT NULL,
	"points_earned" integer DEFAULT 0,
	"is_overdue" boolean DEFAULT false NOT NULL,
	"current_priority" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"household_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"estimated_minutes" integer DEFAULT 5 NOT NULL,
	"points" integer DEFAULT 10 NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"recurrence_type" text,
	"recurrence_interval" integer DEFAULT 1,
	"custom_days" integer,
	"due_date" timestamp,
	"start_date" timestamp,
	"end_date" timestamp,
	"assigned_to" integer NOT NULL,
	"secondary_assignees" text[] DEFAULT '{}',
	"is_active" boolean DEFAULT true NOT NULL,
	"due_date_type" text DEFAULT 'on_date' NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL
);
