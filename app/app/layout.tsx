import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/sidebar";
import { AppHeader } from "@/components/app/header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify user is authenticated, redirect to login if not
  const user = await getCurrentUser().catch(() => {
    redirect("/auth/login");
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-white">
      <SidebarProvider>
        <AppSidebar user={user} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <AppHeader user={user} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
}
