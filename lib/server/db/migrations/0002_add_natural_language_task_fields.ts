import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { tasks } from "../schema";

export async function up(db: any) {
  await db.execute(sql`
    ALTER TABLE ${tasks}
    ADD COLUMN IF NOT EXISTS natural_language_input TEXT,
    ADD COLUMN IF NOT EXISTS ai_estimated_pomodoros INTEGER,
    ADD COLUMN IF NOT EXISTS complexity INTEGER DEFAULT 2,
    ADD COLUMN IF NOT EXISTS energy_required INTEGER DEFAULT 2,
    ADD COLUMN IF NOT EXISTS last_worked_on TIMESTAMP;
  `);
}

export async function down(db: any) {
  await db.execute(sql`
    ALTER TABLE ${tasks}
    DROP COLUMN IF EXISTS natural_language_input,
    DROP COLUMN IF EXISTS ai_estimated_pomodoros,
    DROP COLUMN IF EXISTS complexity,
    DROP COLUMN IF EXISTS energy_required,
    DROP COLUMN IF EXISTS last_worked_on;
  `);
}
