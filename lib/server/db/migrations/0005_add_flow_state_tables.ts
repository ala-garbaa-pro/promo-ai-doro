import { sql } from "drizzle-orm";
import { db } from "@/lib/server/db";

/**
 * Migration to add flow state tables to the database
 * This migration adds tables for tracking flow state sessions, triggers, and metrics
 */
export async function addFlowStateTables() {
  console.log("Running migration: Add flow state tables");

  try {
    // Create flow_state_level enum
    await db.execute(sql`
      CREATE TYPE "public"."flow_state_level" AS ENUM(
        'none',
        'entering',
        'light',
        'deep',
        'exiting'
      );
    `);

    // Create flow_trigger_type enum
    await db.execute(sql`
      CREATE TYPE "public"."flow_trigger_type" AS ENUM(
        'environment',
        'activity',
        'time',
        'ritual'
      );
    `);

    // Create flow_state_sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "flow_state_sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "session_id" uuid REFERENCES sessions(id) ON DELETE SET NULL,
        "start_time" timestamp NOT NULL,
        "end_time" timestamp,
        "duration" integer, -- in seconds
        "max_focus_score" integer NOT NULL,
        "avg_focus_score" integer NOT NULL,
        "flow_state_level" flow_state_level NOT NULL,
        "interruption_count" integer DEFAULT 0,
        "notes" text,
        "created_at" timestamp WITH TIME ZONE DEFAULT now() NOT NULL,
        "updated_at" timestamp WITH TIME ZONE DEFAULT now() NOT NULL
      );
    `);

    // Create flow_state_metrics table for detailed metrics during flow sessions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "flow_state_metrics" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "flow_session_id" uuid NOT NULL REFERENCES flow_state_sessions(id) ON DELETE CASCADE,
        "timestamp" timestamp NOT NULL,
        "focus_score" integer NOT NULL,
        "flow_state_level" flow_state_level NOT NULL,
        "interaction_rate" float NOT NULL,
        "distraction_count" integer DEFAULT 0,
        "confidence_score" integer NOT NULL
      );
    `);

    // Create flow_state_triggers table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "flow_state_triggers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "type" flow_trigger_type NOT NULL,
        "name" varchar(255) NOT NULL,
        "effectiveness" integer NOT NULL, -- 0-100 score
        "frequency" integer NOT NULL, -- count of how often this trigger is used
        "created_at" timestamp WITH TIME ZONE DEFAULT now() NOT NULL,
        "updated_at" timestamp WITH TIME ZONE DEFAULT now() NOT NULL
      );
    `);

    // Create flow_session_triggers junction table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "flow_session_triggers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "flow_session_id" uuid NOT NULL REFERENCES flow_state_sessions(id) ON DELETE CASCADE,
        "trigger_id" uuid NOT NULL REFERENCES flow_state_triggers(id) ON DELETE CASCADE,
        "effectiveness" integer, -- 0-100 score for this specific session
        "created_at" timestamp WITH TIME ZONE DEFAULT now() NOT NULL
      );
    `);

    // Create indexes for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_flow_state_sessions_user_id ON flow_state_sessions(user_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_flow_state_sessions_session_id ON flow_state_sessions(session_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_flow_state_metrics_flow_session_id ON flow_state_metrics(flow_session_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_flow_state_triggers_user_id ON flow_state_triggers(user_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_flow_session_triggers_flow_session_id ON flow_session_triggers(flow_session_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_flow_session_triggers_trigger_id ON flow_session_triggers(trigger_id);
    `);

    console.log("Migration completed: Added flow state tables");
  } catch (error) {
    console.error("Error running migration:", error);
    throw error;
  }
}
