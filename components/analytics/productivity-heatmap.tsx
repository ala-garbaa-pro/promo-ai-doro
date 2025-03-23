"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductivityHeatmapProps {
  data: Array<{
    hour: number;
    completedSessions: number;
    totalMinutes: number;
  }>;
  title?: string;
  description?: string;
}

export function ProductivityHeatmap({
  data = [],
  title = "Productivity Heatmap",
  description = "Your most productive hours",
}: ProductivityHeatmapProps) {
  // Find the maximum value to normalize the heatmap colors
  const maxSessions = Math.max(
    ...data.map((item) => item.completedSessions),
    1
  );

  // Format hour for display (12-hour format with AM/PM)
  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  // Get color intensity based on number of sessions
  const getColorIntensity = (sessions: number) => {
    if (sessions === 0) return "bg-muted/20";

    const intensity = Math.min(Math.round((sessions / maxSessions) * 100), 100);

    // Return different color intensities based on the value
    if (intensity < 20) return "bg-primary/10";
    if (intensity < 40) return "bg-primary/30";
    if (intensity < 60) return "bg-primary/50";
    if (intensity < 80) return "bg-primary/70";
    return "bg-primary/90";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="grid grid-cols-6 gap-2 md:grid-cols-12">
            {data.map((item) => (
              <div key={item.hour} className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-12 w-full rounded-md",
                    getColorIntensity(item.completedSessions)
                  )}
                  title={`${
                    item.completedSessions
                  } completed sessions (${Math.round(
                    item.totalMinutes
                  )} minutes)`}
                />
                <span className="mt-1 text-xs text-muted-foreground">
                  {formatHour(item.hour)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[100px]">
            <p className="text-muted-foreground">No data available yet</p>
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Less productive
            </span>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-primary/10"></div>
              <div className="h-3 w-3 rounded-sm bg-primary/30"></div>
              <div className="h-3 w-3 rounded-sm bg-primary/50"></div>
              <div className="h-3 w-3 rounded-sm bg-primary/70"></div>
              <div className="h-3 w-3 rounded-sm bg-primary/90"></div>
            </div>
            <span className="text-xs text-muted-foreground">
              More productive
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
