"use client";

import { AuthStatus } from "@/components/auth/auth-status";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthTestPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Authentication Test
      </h1>

      <div className="mb-8">
        <AuthStatus />
      </div>

      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link href="/auth/login">Login</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/register">Register</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
