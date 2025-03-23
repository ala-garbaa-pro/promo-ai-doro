
-- START ADDING DEFAULT CONFIG
-- Enable the pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- END ADDING DEFAULT CONFIG
-- START ADDING TABLES FROM ./drizzle
CREATE TYPE "public"."session_type" AS ENUM('work', 'short_break', 'long_break');--> statement-breakpoint
CREATE TYPE "public"."sound_type" AS ENUM('white_noise', 'nature', 'ambient', 'music', 'custom');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"icon" varchar(255),
	"requirement" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"total_work_sessions" integer DEFAULT 0,
	"completed_work_sessions" integer DEFAULT 0,
	"total_work_minutes" integer DEFAULT 0,
	"total_break_minutes" integer DEFAULT 0,
	"focus_score" integer,
	"most_productive_time_start" timestamp,
	"most_productive_time_end" timestamp,
	"completed_tasks" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "focus_sounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" varchar(255) NOT NULL,
	"type" "sound_type" NOT NULL,
	"url" varchar(255) NOT NULL,
	"is_default" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"config" json NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"work_duration" integer NOT NULL,
	"short_break_duration" integer NOT NULL,
	"long_break_duration" integer NOT NULL,
	"long_break_interval" integer NOT NULL,
	"auto_start_breaks" boolean DEFAULT false,
	"auto_start_pomodoros" boolean DEFAULT false,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid,
	"type" "session_type" NOT NULL,
	"duration" integer NOT NULL,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"is_completed" boolean DEFAULT false,
	"was_interrupted" boolean DEFAULT false,
	"interruption_count" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"priority" "task_priority" DEFAULT 'medium',
	"status" "task_status" DEFAULT 'pending',
	"estimated_pomodoros" integer,
	"actual_pomodoros" integer DEFAULT 0,
	"due_date" timestamp,
	"category" varchar(255),
	"tags" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"is_admin" boolean DEFAULT false,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_session_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "team_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"work_duration" integer NOT NULL,
	"short_break_duration" integer NOT NULL,
	"long_break_duration" integer NOT NULL,
	"long_break_interval" integer NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"avatar" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"password" varchar(255),
	"avatar" varchar(255),
	"preferences" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "focus_sounds" ADD CONSTRAINT "focus_sounds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_tasks" ADD CONSTRAINT "session_tasks_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_tasks" ADD CONSTRAINT "session_tasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_templates" ADD CONSTRAINT "session_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_template_id_session_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."session_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_session_participants" ADD CONSTRAINT "team_session_participants_team_session_id_team_sessions_id_fk" FOREIGN KEY ("team_session_id") REFERENCES "public"."team_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_session_participants" ADD CONSTRAINT "team_session_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_sessions" ADD CONSTRAINT "team_sessions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_sessions" ADD CONSTRAINT "team_sessions_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;-- END ADDING TABLES FROM ./drizzle
-- START ADDING DEFAULT USERS
INSERT INTO public.users (id, name, email, avatar, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'John Doe', 'john@example.com', 'https://ui-avatars.com/api/?name=John+Doe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Jane Smith', 'jane@example.com', 'https://ui-avatars.com/api/?name=Jane+Smith', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Admin User', 'admin@subtrack.com', 'https://ui-avatars.com/api/?name=Admin+User', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- END ADDING DEFAULT USERS
-- START ADDING DEFAULT DATA
-- Insert default categories
INSERT INTO public.categories (id, name, description, color, icon, created_at, updated_at)
  (gen_random_uuid(), 'Entertainment', 'Streaming services and entertainment subscriptions', '#FF5733', 'film', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Productivity', 'Tools and services for work and productivity', '#33A1FF', 'briefcase', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Health & Fitness', 'Health and fitness related subscriptions', '#33FF57', 'heart', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Education', 'Learning platforms and educational content', '#F3FF33', 'book', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Gaming', 'Gaming subscriptions and services', '#9B33FF', 'gamepad', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Music', 'Music streaming and services', '#FF33E9', 'music', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'News & Magazines', 'News subscriptions and magazine services', '#33FFE3', 'newspaper', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Other', 'Miscellaneous subscriptions', '#808080', 'package', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default billing cycles
INSERT INTO public.billing_cycles (id, name, interval_count, interval_unit, created_at, updated_at)
  (gen_random_uuid(), 'Monthly', 1, 'month', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Quarterly', 3, 'month', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Biannual', 6, 'month', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Annual', 12, 'month', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Weekly', 1, 'week', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Biweekly', 2, 'week', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert popular subscription services
INSERT INTO public.subscriptions (id, name, description, website, logo, category_id, created_at, updated_at)
  (gen_random_uuid(), 'Netflix', 'Streaming service for movies and TV shows', 'https://netflix.com', 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png', (SELECT id FROM public.categories WHERE name = 'Entertainment' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Spotify', 'Music streaming service', 'https://spotify.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/1982px-Spotify_icon.svg.png', (SELECT id FROM public.categories WHERE name = 'Music' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Amazon Prime', 'Shopping and streaming service', 'https://amazon.com/prime', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Amazon_Prime_Logo.svg/2560px-Amazon_Prime_Logo.svg.png', (SELECT id FROM public.categories WHERE name = 'Entertainment' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Disney+', 'Disney streaming service', 'https://disneyplus.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/2560px-Disney%2B_logo.svg.png', (SELECT id FROM public.categories WHERE name = 'Entertainment' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'YouTube Premium', 'Ad-free YouTube experience', 'https://youtube.com/premium', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/YouTube_play_buttom_icon_%282013-2017%29.svg/1024px-YouTube_play_buttom_icon_%282013-2017%29.svg.png', (SELECT id FROM public.categories WHERE name = 'Entertainment' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Microsoft 365', 'Productivity suite', 'https://microsoft.com/microsoft-365', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Microsoft_365_%282022%29.svg/2560px-Microsoft_365_%282022%29.svg.png', (SELECT id FROM public.categories WHERE name = 'Productivity' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Adobe Creative Cloud', 'Creative software suite', 'https://adobe.com/creativecloud', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Adobe_Creative_Cloud_rainbow_icon.svg/1024px-Adobe_Creative_Cloud_rainbow_icon.svg.png', (SELECT id FROM public.categories WHERE name = 'Productivity' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Peloton', 'Fitness and workout subscription', 'https://onepeloton.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Peloton_logo.svg/2560px-Peloton_logo.svg.png', (SELECT id FROM public.categories WHERE name = 'Health & Fitness' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Coursera Plus', 'Online learning platform', 'https://coursera.org/plus', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Coursera-Logo_600x600.svg/1200px-Coursera-Logo_600x600.svg.png', (SELECT id FROM public.categories WHERE name = 'Education' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Xbox Game Pass', 'Gaming subscription service', 'https://xbox.com/gamepass', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Xbox_one_logo.svg/1024px-Xbox_one_logo.svg.png', (SELECT id FROM public.categories WHERE name = 'Gaming' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- END ADDING DEFAULT DATA
