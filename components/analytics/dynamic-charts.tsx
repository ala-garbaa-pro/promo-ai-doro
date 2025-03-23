"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic imports for chart components
export const DynamicFocusTimeChart = dynamic(
  () =>
    import("@/components/analytics/focus-time-chart").then((mod) => ({
      default: mod.FocusTimeChart,
    })),
  {
    loading: () => (
      <div className="w-full h-[300px] flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicTaskCompletionChart = dynamic(
  () =>
    import("@/components/analytics/task-completion-chart").then((mod) => ({
      default: mod.TaskCompletionChart,
    })),
  {
    loading: () => (
      <div className="w-full h-[300px] flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicProductivityHeatmap = dynamic(
  () =>
    import("@/components/analytics/productivity-heatmap").then((mod) => ({
      default: mod.ProductivityHeatmap,
    })),
  {
    loading: () => (
      <div className="w-full h-[150px] flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    ),
    ssr: false,
  }
);
