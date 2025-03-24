import { db } from "@/lib/server/db";
import { up } from "@/lib/server/db/migrations/0002_add_natural_language_task_fields";

async function runMigration() {
  console.log("Running migration to add natural language task fields...");

  try {
    await up(db);
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

runMigration();
