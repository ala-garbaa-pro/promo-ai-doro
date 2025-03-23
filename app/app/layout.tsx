import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/better-auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/sidebar";
import { AppHeader } from "@/components/app/header";
import { KeyboardShortcutsProvider } from "@/components/app/keyboard-shortcuts-provider";
import { Toaster } from "@/components/ui/toaster";
import { SettingsProvider } from "@/components/app/settings-provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify user is authenticated, redirect to login if not
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user;

  return (
    <SettingsProvider>
      <KeyboardShortcutsProvider>
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
          <SidebarProvider>
            <AppSidebar user={user} />
            <div className="flex flex-col flex-1 overflow-hidden">
              <AppHeader user={user} />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </SidebarProvider>
        </div>
        <Toaster />
      </KeyboardShortcutsProvider>
    </SettingsProvider>
  );
}
