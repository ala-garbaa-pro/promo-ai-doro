import { sql } from "drizzle-orm";
import { db } from "..";

export async function runMigration() {
  try {
    console.log(
      "Adding taskText and isDefault fields to task_templates table..."
    );

    // Add taskText column
    await db.execute(sql`
      ALTER TABLE task_templates
      ADD COLUMN IF NOT EXISTS task_text TEXT;
    `);

    // Add isDefault column
    await db.execute(sql`
      ALTER TABLE task_templates
      ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;
    `);

    console.log("Migration completed successfully");
    return { success: true };
  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, error };
  }
}
