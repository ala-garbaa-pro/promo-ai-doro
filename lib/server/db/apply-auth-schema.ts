import { db } from "./index";
import { sql } from "drizzle-orm";

async function applyAuthSchema() {
  try {
    console.log("Applying auth schema...");

    // Add email_verified column if it doesn't exist
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'email_verified'
        ) THEN
          ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false;
        END IF;
      END $$;
    `);

    // Create sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" text PRIMARY KEY,
        "expires_at" timestamp NOT NULL,
        "token" text NOT NULL UNIQUE,
        "created_at" timestamp NOT NULL,
        "updated_at" timestamp NOT NULL,
        "ip_address" text,
        "user_agent" text,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Create accounts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" text PRIMARY KEY,
        "account_id" text NOT NULL,
        "provider_id" text NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "access_token" text,
        "refresh_token" text,
        "id_token" text,
        "access_token_expires_at" timestamp,
        "refresh_token_expires_at" timestamp,
        "scope" text,
        "password" text,
        "created_at" timestamp NOT NULL,
        "updated_at" timestamp NOT NULL
      );
    `);

    // Create verifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "verifications" (
        "id" text PRIMARY KEY,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp,
        "updated_at" timestamp
      );
    `);

    console.log("Auth schema applied successfully!");
  } catch (error) {
    console.error("Error applying auth schema:", error);
  } finally {
    process.exit(0);
  }
}

applyAuthSchema();
