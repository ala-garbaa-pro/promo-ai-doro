import { sql } from "drizzle-orm";

export function up(db: any) {
  // Add any missing fields to the analytics table
  db.run(sql`
    DO $$ 
    BEGIN
      -- Check if focus_score column exists and add it if it doesn't
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'focus_score'
      ) THEN
        ALTER TABLE "analytics" ADD COLUMN "focus_score" integer;
      END IF;
      
      -- Check if completed_tasks column exists and add it if it doesn't
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'completed_tasks'
      ) THEN
        ALTER TABLE "analytics" ADD COLUMN "completed_tasks" integer DEFAULT 0;
      END IF;
      
      -- Check if total_work_sessions column exists and add it if it doesn't
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'total_work_sessions'
      ) THEN
        ALTER TABLE "analytics" ADD COLUMN "total_work_sessions" integer DEFAULT 0;
      END IF;
      
      -- Check if completed_work_sessions column exists and add it if it doesn't
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'completed_work_sessions'
      ) THEN
        ALTER TABLE "analytics" ADD COLUMN "completed_work_sessions" integer DEFAULT 0;
      END IF;
      
      -- Check if total_work_minutes column exists and add it if it doesn't
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'total_work_minutes'
      ) THEN
        ALTER TABLE "analytics" ADD COLUMN "total_work_minutes" integer DEFAULT 0;
      END IF;
      
      -- Check if total_break_minutes column exists and add it if it doesn't
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'total_break_minutes'
      ) THEN
        ALTER TABLE "analytics" ADD COLUMN "total_break_minutes" integer DEFAULT 0;
      END IF;
    END $$;
  `);

  // Add any missing fields to the sessions table
  db.run(sql`
    DO $$ 
    BEGIN
      -- Check if interruption_count column exists and add it if it doesn't
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'interruption_count'
      ) THEN
        ALTER TABLE "sessions" ADD COLUMN "interruption_count" integer DEFAULT 0;
      END IF;
      
      -- Check if was_interrupted column exists and add it if it doesn't
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'was_interrupted'
      ) THEN
        ALTER TABLE "sessions" ADD COLUMN "was_interrupted" boolean DEFAULT false;
      END IF;
      
      -- Check if notes column exists and add it if it doesn't
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'notes'
      ) THEN
        ALTER TABLE "sessions" ADD COLUMN "notes" text;
      END IF;
    END $$;
  `);
}

export function down(db: any) {
  // We don't want to remove columns in the down migration
  // as it could lead to data loss
}
