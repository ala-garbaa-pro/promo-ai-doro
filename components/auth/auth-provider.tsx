"use client";

import { ReactNode } from "react";
import { authClient } from "@/lib/auth/better-auth-client";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return children;
}

export function useAuth() {
  const session = authClient.useSession();

  return {
    user: session.data?.user || null,
    isLoading: session.isPending,
    isAuthenticated: !!session.data,
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut: authClient.signOut,
  };
}
