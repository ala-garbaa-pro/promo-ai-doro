"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { setupOfflineSync } from "@/lib/utils/offline-sync";
import { useToast } from "@/components/ui/use-toast";

interface OfflineSyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
}

const OfflineSyncContext = createContext<OfflineSyncContextType>({
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null,
});

export const useOfflineSync = () => useContext(OfflineSyncContext);

interface OfflineSyncProviderProps {
  children: ReactNode;
}

export function OfflineSyncProvider({ children }: OfflineSyncProviderProps) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize offline sync
    setupOfflineSync();

    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);

      toast({
        title: "You're back online",
        description: "Syncing your data...",
      });

      // Simulate sync completion (in a real app, this would be triggered by the actual sync process)
      setTimeout(() => {
        setIsSyncing(false);
        setLastSyncTime(new Date());

        toast({
          title: "Sync complete",
          description: "Your data has been synchronized",
        });
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsSyncing(false);

      toast({
        title: "You're offline",
        description:
          "Changes will be saved locally and synced when you're back online",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        isSyncing,
        lastSyncTime,
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
}
