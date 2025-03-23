"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Search, Plus, Menu, X, Sun, Moon } from "lucide-react";
import { FocusModeToggle } from "@/components/cognitive-enhancement/focus-mode-toggle";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { OfflineStatus } from "./offline-status";

interface AppHeaderProps {
  user: {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  const { toggleSidebar, isMobile } = useSidebar();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>

          <SidebarTrigger className="hidden md:flex bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground" />

          <div className="hidden md:flex relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] lg:w-[300px] pl-8 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <OfflineStatus />
          <ThemeToggle />
          <FocusModeToggle variant="compact" />

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="mr-1 h-4 w-4" />
            New Task
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>

          <Link href="/app/profile">
            <UserAvatar
              user={{
                name: user.name,
                image: user.avatar,
              }}
              size="sm"
              className="transition-transform hover:scale-105"
            />
          </Link>
        </div>
      </div>

      {/* Mobile Search */}
      {showMobileMenu && (
        <div className="border-t border-border p-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </div>
        </div>
      )}
    </header>
  );
}
