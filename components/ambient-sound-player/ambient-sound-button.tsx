"use client";

import { Button } from "@/components/ui/button";
import { AmbientSound } from "@/hooks/use-ambient-sounds";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import dynamic from "next/dynamic";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettings } from "@/lib/contexts/settings-context";

// Dynamically import icons to reduce bundle size
const icons: Record<string, LucideIcon> = {};

interface AmbientSoundButtonProps {
  sound: AmbientSound;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export function AmbientSoundButton({
  sound,
  isActive,
  onClick,
  className,
}: AmbientSoundButtonProps) {
  const { settings } = useSettings();
  const showDescriptions = settings.notification.ambientSounds.showDescriptions;
  // Dynamically load the icon
  let IconComponent: LucideIcon | null = null;

  if (!icons[sound.icon]) {
    try {
      // This is a workaround for dynamic imports with Lucide icons
      const iconModule = require(`lucide-react`);
      icons[sound.icon] =
        iconModule[sound.icon.charAt(0).toUpperCase() + sound.icon.slice(1)];
    } catch (error) {
      console.error(`Failed to load icon: ${sound.icon}`, error);
    }
  }

  IconComponent = icons[sound.icon] || null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? "default" : "outline"}
            onClick={onClick}
            className={cn(
              "relative",
              isActive && "bg-primary text-primary-foreground",
              className
            )}
            aria-label={`${isActive ? "Stop" : "Play"} ${sound.name}`}
          >
            {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
            <span>{sound.name}</span>
            {sound.type === "binaural" && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs px-1 rounded-full">
                β
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {showDescriptions && <p>{sound.description || sound.name}</p>}
          {!showDescriptions && <p>{sound.name}</p>}
          {sound.frequency && (
            <p className="text-xs text-muted-foreground mt-1">
              {sound.frequency.beat} Hz beat frequency
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
