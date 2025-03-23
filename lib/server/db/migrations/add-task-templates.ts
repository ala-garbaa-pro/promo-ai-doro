import { sql } from "drizzle-orm";
import { db } from "../index";

export async function createTaskTemplatesTables() {
  try {
    // Check if the task_templates table already exists
    const templatesTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'task_templates'
      );
    `);

    if (templatesTableExists.rows[0].exists) {
      console.log("task_templates table already exists, skipping creation");
    } else {
      // Create the task_templates table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS task_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          priority VARCHAR(50) DEFAULT 'medium',
          estimated_pomodoros INTEGER,
          category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
          tags JSONB,
          is_recurring BOOLEAN DEFAULT false,
          recurring_type VARCHAR(50),
          recurring_interval INTEGER,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      // Create indexes for better performance
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_task_templates_user_id ON task_templates(user_id);
      `);

      console.log("Successfully created task_templates table and indexes");
    }

    // Check if the template_items table already exists
    const itemsTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'template_items'
      );
    `);

    if (itemsTableExists.rows[0].exists) {
      console.log("template_items table already exists, skipping creation");
    } else {
      // Create the template_items table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS template_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          priority VARCHAR(50) DEFAULT 'medium',
          estimated_pomodoros INTEGER,
          category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
          tags JSONB,
          "order" INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      // Create indexes for better performance
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_template_items_template_id ON template_items(template_id);
      `);

      console.log("Successfully created template_items table and indexes");
    }

    // Check if the template_item_dependencies table already exists
    const dependenciesTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'template_item_dependencies'
      );
    `);

    if (dependenciesTableExists.rows[0].exists) {
      console.log(
        "template_item_dependencies table already exists, skipping creation"
      );
    } else {
      // Create the template_item_dependencies table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS template_item_dependencies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          item_id UUID NOT NULL REFERENCES template_items(id) ON DELETE CASCADE,
          depends_on_item_id UUID NOT NULL REFERENCES template_items(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          UNIQUE(item_id, depends_on_item_id)
        );
      `);

      // Create indexes for better performance
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_template_item_dependencies_item_id ON template_item_dependencies(item_id);
      `);

      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_template_item_dependencies_depends_on_item_id ON template_item_dependencies(depends_on_item_id);
      `);

      console.log(
        "Successfully created template_item_dependencies table and indexes"
      );
    }

    console.log("Task templates migration completed successfully");
  } catch (error) {
    console.error("Error creating task templates tables:", error);
    throw error;
  }
}

export async function runMigration() {
  try {
    await createTaskTemplatesTables();
    console.log("Task templates migration completed successfully");
  } catch (error) {
    console.error("Task templates migration failed:", error);
    throw error;
  }
}
