"use client";

import { createAuthClient } from "better-auth/react";

// Create the auth client
export const authClient = createAuthClient({
  // Base URL of the auth API (optional if on same domain)
  baseURL: process.env.NEXT_PUBLIC_APP_URL,

  // Default redirect URLs
  redirects: {
    afterSignIn: "/dashboard",
    afterSignUp: "/dashboard",
    afterSignOut: "/auth/login",
  },
});

// Export individual methods for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
