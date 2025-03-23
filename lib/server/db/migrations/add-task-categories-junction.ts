import { sql } from "drizzle-orm";
import { db } from "../index";

export async function createTaskCategoriesTable() {
  try {
    // Check if the table already exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'task_categories'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log("task_categories table already exists, skipping creation");
      return;
    }

    // Create the task_categories junction table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS task_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(task_id, category_id)
      );
    `);

    // Create indexes for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_task_categories_task_id ON task_categories(task_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_task_categories_category_id ON task_categories(category_id);
    `);

    console.log("Successfully created task_categories table and indexes");
  } catch (error) {
    console.error("Error creating task_categories table:", error);
    throw error;
  }
}

export async function migrateExistingTaskCategories() {
  try {
    // Migrate existing task-category relationships
    await db.execute(sql`
      INSERT INTO task_categories (task_id, category_id)
      SELECT id, category_id FROM tasks
      WHERE category_id IS NOT NULL
      ON CONFLICT (task_id, category_id) DO NOTHING;
    `);

    console.log("Successfully migrated existing task-category relationships");
  } catch (error) {
    console.error(
      "Error migrating existing task-category relationships:",
      error
    );
    throw error;
  }
}

export async function runMigration() {
  try {
    await createTaskCategoriesTable();
    await migrateExistingTaskCategories();
    console.log("Task categories migration completed successfully");
  } catch (error) {
    console.error("Task categories migration failed:", error);
    throw error;
  }
}
