"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Search, Plus, Menu, X } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

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

  // Get user initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return user.email.substring(0, 2).toUpperCase();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>

          <SidebarTrigger className="hidden md:flex bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white" />

          <div className="hidden md:flex relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] lg:w-[300px] pl-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            className="hidden md:flex bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="mr-1 h-4 w-4" />
            New Task
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>

          <Link href="/app/profile">
            <Avatar className="h-8 w-8 transition-transform hover:scale-105">
              <AvatarImage src={user.avatar} alt={user.name || user.email} />
              <AvatarFallback className="bg-indigo-600 text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      {/* Mobile Search */}
      {showMobileMenu && (
        <div className="border-t border-gray-800 p-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </header>
  );
}
