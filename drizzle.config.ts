import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables based on NODE_ENV
const envFile =
  process.env.NODE_ENV === "production" ? "./.prod.env" : "./.dev.env";
dotenv.config({
  path: envFile,
});

if (typeof process.env.DATABASE_URL !== "string") {
  throw new Error("Please set your DATABASE_URL");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/server/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: process.env.NODE_ENV !== "production", // Disable verbose logging in production
  strict: true,
});
