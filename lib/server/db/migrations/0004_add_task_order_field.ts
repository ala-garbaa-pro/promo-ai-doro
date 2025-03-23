import { sql } from "drizzle-orm";

export function up(db: any) {
  // Add order field to tasks table if it doesn't exist
  db.run(sql`
    DO $$ 
    BEGIN
      -- Check if order column exists and add it if it doesn't
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'order'
      ) THEN
        ALTER TABLE "tasks" ADD COLUMN "order" integer DEFAULT 0;
      END IF;
      
      -- Update existing tasks to have sequential order based on creation date
      UPDATE tasks
      SET "order" = subquery.row_num
      FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as row_num
        FROM tasks
      ) AS subquery
      WHERE tasks.id = subquery.id AND tasks."order" = 0;
    END $$;
  `);
}

export function down(db: any) {
  // Remove the order column if needed
  db.run(sql`
    DO $$ 
    BEGIN
      IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'order'
      ) THEN
        ALTER TABLE "tasks" DROP COLUMN "order";
      END IF;
    END $$;
  `);
}
