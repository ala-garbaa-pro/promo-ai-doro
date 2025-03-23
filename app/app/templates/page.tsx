import { auth } from "@/lib/auth/better-auth";
import { redirect } from "next/navigation";
import { TaskTemplatesList } from "@/components/tasks/task-templates-list";

export const metadata = {
  title: "Task Templates - Pomo AI-doro",
  description: "Manage your task templates",
};

export default async function TemplatesPage() {
  // Check if user is authenticated
  const session = await auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Task Templates</h1>
        <p className="text-muted-foreground">
          Create and manage templates for repetitive tasks and workflows.
        </p>
      </div>

      <TaskTemplatesList />
    </div>
  );
}
