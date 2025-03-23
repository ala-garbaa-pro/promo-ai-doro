import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export function up(db: any) {
  // Create users table if it doesn't exist
  // Note: We're checking if our users table already exists and has the required columns
  // If not, we'll add the missing columns

  // Add email_verified column if it doesn't exist
  db.run(sql`
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
  db.run(sql`
    CREATE TABLE IF NOT EXISTS "sessions" (
      "id" text PRIMARY KEY,
      "expires_at" timestamp NOT NULL,
      "token" text NOT NULL UNIQUE,
      "created_at" timestamp NOT NULL,
      "updated_at" timestamp NOT NULL,
      "ip_address" text,
      "user_agent" text,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
    );
  `);

  // Create accounts table
  db.run(sql`
    CREATE TABLE IF NOT EXISTS "accounts" (
      "id" text PRIMARY KEY,
      "account_id" text NOT NULL,
      "provider_id" text NOT NULL,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
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
  db.run(sql`
    CREATE TABLE IF NOT EXISTS "verifications" (
      "id" text PRIMARY KEY,
      "identifier" text NOT NULL,
      "value" text NOT NULL,
      "expires_at" timestamp NOT NULL,
      "created_at" timestamp,
      "updated_at" timestamp
    );
  `);
}

export function down(db: any) {
  // Drop tables in reverse order to avoid foreign key constraints
  db.run(sql`DROP TABLE IF EXISTS "verifications";`);
  db.run(sql`DROP TABLE IF EXISTS "accounts";`);
  db.run(sql`DROP TABLE IF EXISTS "sessions";`);

  // We don't drop the users table as it might contain other data
  // But we can remove the email_verified column if needed
  db.run(sql`
    DO $$ 
    BEGIN
      IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email_verified'
      ) THEN
        ALTER TABLE "users" DROP COLUMN "email_verified";
      END IF;
    END $$;
  `);
}
