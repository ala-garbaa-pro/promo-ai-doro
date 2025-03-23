import { db } from "@/lib/server/db";
import { up } from "@/lib/server/db/migrations/0004_add_task_order_field";

async function runMigration() {
  try {
    console.log("Running migration to add order field to tasks table...");
    await up(db);
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
