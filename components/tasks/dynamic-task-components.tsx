"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic import for TaskDetails component
export const DynamicTaskDetails = dynamic(
  () =>
    import("@/components/tasks/task-details").then((mod) => ({
      default: mod.TaskDetails,
    })),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-card">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-4 w-2/3 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-end mt-6 gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

// Dynamic import for TaskFiltersComponent
export const DynamicTaskFilters = dynamic(
  () =>
    import("@/components/tasks/task-filters").then((mod) => ({
      default: mod.TaskFiltersComponent,
    })),
  {
    loading: () => <Skeleton className="h-10 w-32" />,
    ssr: false,
  }
);
