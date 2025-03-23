import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RunMigrationButton } from "@/components/admin/run-migration-button";
import { auth } from "@/lib/auth/better-auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin - Pomo AI-doro",
  description: "Admin tools for Pomo AI-doro",
};

export default async function AdminPage() {
  // Check if user is authenticated and is an admin
  const session = await auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (!session.user.isAdmin) {
    redirect("/app");
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Tools</h1>
        <p className="text-muted-foreground">
          Manage your application settings and run maintenance tasks.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Database Migrations</CardTitle>
            <CardDescription>
              Run database migrations to update your schema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RunMigrationButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
