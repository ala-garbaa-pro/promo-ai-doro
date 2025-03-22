import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "./schema";

// Control verbose logging
const VERBOSE_LOGGING = false;

// Load environment variables from .dev.env
dotenv.config({ path: "./.dev.env" });

/**
 * Database connection singleton implementation
 * This ensures the connection pool is initialized only once across the application
 *
 * This implementation follows the recommended pattern for Next.js applications
 * to prevent connection pool exhaustion during development and production.
 */

// Define a more specific global object to avoid namespace conflicts
// This is a key improvement for Next.js module caching
const globalForDb = global as unknown as {
  pgConnection: {
    client?: ReturnType<typeof postgres>;
    db?: ReturnType<typeof drizzle>;
    connectionId?: string;
    isConnected: boolean;
  };
};

// Initialize the global object if it doesn't exist
if (!globalForDb.pgConnection) {
  globalForDb.pgConnection = {
    client: undefined,
    db: undefined,
    connectionId: undefined,
    isConnected: false,
  };
}

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

// Configure connection pool options based on environment
const connectionOptions = {
  max: process.env.NODE_ENV === "production" ? 20 : 5, // Smaller pool for development
  idle_timeout: 30, // Connection idle timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
  // Add additional options as needed
};

// Function to create a new database connection with a unique ID for tracking
function createDbConnection() {
  try {
    VERBOSE_LOGGING &&
      console.log("[Database] Initializing database connection...");

    // Create the PostgreSQL client with the configured options
    const client = postgres(
      process.env.DATABASE_URL as string,
      connectionOptions
    );
    VERBOSE_LOGGING && console.log("[Database] PostgreSQL client created");

    // Initialize Drizzle ORM with the client and schema
    const db = drizzle(client, {
      schema, // Pass the schema for better type safety and relations
      logger: process.env.NODE_ENV !== "production", // Enable logging in development
    });
    VERBOSE_LOGGING && console.log("[Database] Drizzle ORM initialized");

    // Generate a unique connection ID for debugging
    const connectionId = Math.random().toString(36).substring(2, 10);
    console.log(`[Database] Connection ID: ${connectionId}`);

    return { client, db, connectionId };
  } catch (error) {
    console.error(
      "[Database] Failed to initialize database connection:",
      error
    );
    throw error;
  }
}

// Get or create the database connection
let db: ReturnType<typeof drizzle>;

// This is the key part - we use a more reliable approach to singleton management
if (process.env.NODE_ENV === "production") {
  VERBOSE_LOGGING && console.log("[Database] Production environment detected");

  if (!globalForDb.pgConnection.isConnected) {
    const conn = createDbConnection();
    globalForDb.pgConnection.client = conn.client;
    globalForDb.pgConnection.db = conn.db;
    globalForDb.pgConnection.connectionId = conn.connectionId;
    globalForDb.pgConnection.isConnected = true;
    VERBOSE_LOGGING &&
      console.log(
        `[Database] Created new production connection with ID: ${conn.connectionId}`
      );
    db = conn.db;
  } else {
    console.log(
      `[Database] Reusing connection with ID: ${globalForDb.pgConnection.connectionId}`
    );
    db = globalForDb.pgConnection.db!;
  }
} else {
  VERBOSE_LOGGING && console.log("[Database] Development environment detected");

  if (!globalForDb.pgConnection.isConnected) {
    const conn = createDbConnection();
    globalForDb.pgConnection.client = conn.client;
    globalForDb.pgConnection.db = conn.db;
    globalForDb.pgConnection.connectionId = conn.connectionId;
    globalForDb.pgConnection.isConnected = true;
    VERBOSE_LOGGING &&
      console.log(
        `[Database] Created new development connection with ID: ${conn.connectionId}`
      );
    db = conn.db;
  } else {
    console.log(
      `[Database] Reusing connection with ID: ${globalForDb.pgConnection.connectionId}`
    );
    db = globalForDb.pgConnection.db!;
  }
}

VERBOSE_LOGGING && console.log("[Database] Database connection ready");

/**
 * Helper function to check if we're using a cached connection
 * You can call this in your API routes or server components to debug
 */
export function getConnectionStatus() {
  return {
    isConnected: globalForDb.pgConnection.isConnected,
    connectionId: globalForDb.pgConnection.connectionId,
    environment: process.env.NODE_ENV || "unknown",
    timestamp: new Date().toISOString(),
  };
}

export { db };
