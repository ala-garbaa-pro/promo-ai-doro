"use client";

import { useOfflineSync } from "./offline-sync-provider";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

export function OfflineStatus() {
  const { isOnline, isSyncing, lastSyncTime } = useOfflineSync();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={isOnline ? "outline" : "destructive"}
            className={cn(
              "gap-1 h-7 px-2 transition-all duration-300",
              isOnline ? "hover:bg-green-500/10" : "hover:bg-destructive/90"
            )}
          >
            {isOnline ? (
              <>
                <Wifi className="h-3.5 w-3.5" />
                {isSyncing ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Online"
                )}
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                Offline
              </>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isOnline ? (
            <>
              <p>You are online</p>
              {isSyncing ? (
                <p className="text-xs text-muted-foreground">
                  Syncing your data...
                </p>
              ) : lastSyncTime ? (
                <p className="text-xs text-muted-foreground">
                  Last synced: {format(lastSyncTime, "MMM d, h:mm a")}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p>You are offline</p>
              <p className="text-xs text-muted-foreground">
                Changes will be saved locally and synced when you're back online
              </p>
            </>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
