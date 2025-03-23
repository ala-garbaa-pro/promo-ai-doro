"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ user, className, size = "md" }: UserAvatarProps) {
  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {user.image ? (
        <AvatarImage
          src={user.image}
          alt={user.name || "User"}
          width={size === "lg" ? 56 : size === "md" ? 40 : 32}
          height={size === "lg" ? 56 : size === "md" ? 40 : 32}
          loading="lazy"
        />
      ) : null}
      <AvatarFallback>
        {user.name ? getInitials(user.name) : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}
