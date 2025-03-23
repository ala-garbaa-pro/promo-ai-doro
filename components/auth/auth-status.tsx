"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle } from "lucide-react";

export function AuthStatus() {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <LoaderCircle className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-medium">Status:</p>
            <p className={isAuthenticated ? "text-green-600" : "text-red-600"}>
              {isAuthenticated ? "Authenticated" : "Not authenticated"}
            </p>
          </div>

          {user && (
            <div className="space-y-2">
              <p className="font-medium">User Information:</p>
              <div className="pl-4 border-l-2 border-gray-200">
                <p>
                  <span className="font-medium">ID:</span> {user.id}
                </p>
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {user.name || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
              </div>
            </div>
          )}

          {isAuthenticated && (
            <Button
              variant="destructive"
              onClick={() => signOut()}
              className="w-full"
            >
              Sign Out
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
