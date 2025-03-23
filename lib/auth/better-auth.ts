import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/server/db";
import { users } from "@/lib/server/db/schema";

// Create the auth instance
export const auth = betterAuth({
  // Use Drizzle adapter with PostgreSQL
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: false, // We're providing the schema directly
    schema: {
      user: users, // Map the users table to the user table expected by better-auth
    },
    idType: "uuid", // Specify that we're using UUID for IDs
  }),

  // Enable email and password authentication
  emailAndPassword: {
    enabled: true,
    // Customize validation if needed
    validation: {
      password: {
        minLength: 8,
        maxLength: 100,
      },
    },
    // Auto sign in after registration
    autoSignIn: true,
  },

  // Session configuration
  session: {
    // Session expiration time (7 days)
    expiresIn: 60 * 60 * 24 * 7,
    // Use JWT for session
    strategy: "jwt",
    // Cookie settings
    cookie: {
      name: "pomo_session",
      // Use secure cookies in production
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },

  // Use Next.js cookies plugin to handle cookies in server actions
  plugins: [nextCookies()],

  // Customize URLs if needed
  urls: {
    signIn: "/auth/login",
    signUp: "/auth/register",
    error: "/auth/error",
    verifyEmail: "/auth/verify",
  },
});

// Export type-safe session
export type Session = typeof auth.$Infer.Session;
