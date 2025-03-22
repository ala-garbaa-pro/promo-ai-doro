"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  BarChart3,
  ListTodo,
  Settings,
  Calendar,
  Users,
  Home,
  LogOut,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";

interface AppSidebarProps {
  user: {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { logout } = useAuth();

  // Get user initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return user.email.substring(0, 2).toUpperCase();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Sidebar className="border-gray-800 bg-gray-900">
      <SidebarHeader className="flex items-center border-gray-800 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
            <Clock className="h-4 w-4 text-white" />
          </div>
          {open && (
            <span className="text-lg font-semibold text-white">
              Pomo AI-doro
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        <SidebarNav>
          <SidebarNavItem
            href="/app"
            icon={<Home className="h-5 w-5" />}
            label="Dashboard"
            active={pathname === "/app"}
          />
          <SidebarNavItem
            href="/app/timer"
            icon={<Clock className="h-5 w-5" />}
            label="Timer"
            active={pathname === "/app/timer"}
          />
          <SidebarNavItem
            href="/app/tasks"
            icon={<ListTodo className="h-5 w-5" />}
            label="Tasks"
            active={pathname === "/app/tasks"}
          />
          <SidebarNavItem
            href="/app/analytics"
            icon={<BarChart3 className="h-5 w-5" />}
            label="Analytics"
            active={pathname === "/app/analytics"}
          />
          <SidebarNavItem
            href="/app/calendar"
            icon={<Calendar className="h-5 w-5" />}
            label="Calendar"
            active={pathname === "/app/calendar"}
          />
          <SidebarNavItem
            href="/app/teams"
            icon={<Users className="h-5 w-5" />}
            label="Teams"
            active={pathname === "/app/teams"}
          />
        </SidebarNav>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel>{open ? "Recent Tasks" : ""}</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            {open ? (
              <div className="space-y-1 text-sm">
                <p className="px-2 py-1.5 text-gray-400">
                  Complete project proposal
                </p>
                <p className="px-2 py-1.5 text-gray-400">
                  Research new features
                </p>
                <p className="px-2 py-1.5 text-gray-400">
                  Review documentation
                </p>
              </div>
            ) : (
              <div className="flex justify-center">
                <ListTodo className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-gray-800 px-6 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar} alt={user.name || user.email} />
            <AvatarFallback className="bg-indigo-600 text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          {open && (
            <div className="flex flex-1 items-center justify-between">
              <div className="truncate">
                <p className="text-sm font-medium text-white truncate">
                  {user.name || user.email}
                </p>
                {user.name && (
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-8 w-8 text-gray-400 hover:text-white"
                >
                  <Link href="/app/settings">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8 text-gray-400 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            </div>
          )}

          {!open && (
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-8 w-8 text-gray-400 hover:text-white"
              >
                <Link href="/app/settings">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-gray-400 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
