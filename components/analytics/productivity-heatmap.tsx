"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface ProductivityHeatmapProps {
  data: Array<{
    hour: number;
    day?: number;
    completedSessions: number;
    totalMinutes: number;
  }>;
  title?: string;
  description?: string;
  showDayOfWeek?: boolean;
}

export function ProductivityHeatmap({
  data = [],
  title = "Productivity Heatmap",
  description = "Your most productive hours",
  showDayOfWeek = false,
}: ProductivityHeatmapProps) {
  const [view, setView] = useState<"sessions" | "minutes">("sessions");
  // Find the maximum values to normalize the heatmap colors
  const maxSessions = Math.max(
    ...data.map((item) => item.completedSessions),
    1
  );

  const maxMinutes = Math.max(...data.map((item) => item.totalMinutes), 1);

  // Days of the week
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Format hour for display (12-hour format with AM/PM)
  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  // Get color intensity based on value
  const getColorIntensity = (value: number, maxValue: number) => {
    if (value === 0) return "bg-muted/20";

    const intensity = Math.min(value / maxValue, 1);
    return `bg-primary/[${intensity.toFixed(2)}]`;
  };

  // Get tooltip content for a cell
  const getTooltipContent = (item: any) => {
    if (!item) return "No data available";

    const hourStr = formatHour(item.hour);
    const dayStr = item.day !== undefined ? `${days[item.day]}, ` : "";

    return `${dayStr}${hourStr}: ${item.completedSessions} sessions, ${item.totalMinutes} minutes`;
  };

  // Get data for a specific hour and day
  const getItemData = (hour: number, day?: number) => {
    if (day !== undefined) {
      return data.find((item) => item.hour === hour && item.day === day);
    }
    return data.find((item) => item.hour === hour);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as any)}
            className="w-auto"
          >
            <TabsList className="grid w-[180px] grid-cols-2">
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="minutes">Minutes</TabsTrigger>
            </TabsList>
          </Tabs>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Info</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Darker colors indicate higher productivity</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <TabsContent value="sessions" className="mt-0">
          {showDayOfWeek ? (
            // Day of week heatmap
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Day labels */}
                <div className="flex mb-1">
                  <div className="w-12" /> {/* Spacer for hour labels */}
                  {days.map((day) => (
                    <div
                      key={day}
                      className="flex-1 text-xs text-muted-foreground text-center"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex">
                  {/* Hour labels */}
                  <div className="flex flex-col mr-2 w-10">
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <div
                        key={hour}
                        className="h-8 flex items-center justify-end text-xs text-muted-foreground"
                      >
                        {hour % 3 === 0 ? formatHour(hour) : ""}
                      </div>
                    ))}
                  </div>

                  {/* Cells */}
                  <div className="flex-1 grid grid-cols-7 gap-1">
                    {days.map((_, dayIndex) => (
                      <div key={dayIndex} className="flex flex-col gap-1">
                        {Array.from({ length: 24 }).map((_, hour) => {
                          const itemData = getItemData(hour, dayIndex);
                          const sessions = itemData?.completedSessions || 0;

                          return (
                            <TooltipProvider key={`${dayIndex}-${hour}`}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "h-8 rounded-sm",
                                      getColorIntensity(sessions, maxSessions)
                                    )}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  {getTooltipContent(itemData) ||
                                    `${days[dayIndex]}, ${formatHour(
                                      hour
                                    )}: No data`}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : // Hour of day heatmap (original view)
          data.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
              {Array.from({ length: 24 }).map((_, hour) => {
                const itemData = getItemData(hour);
                const sessions = itemData?.completedSessions || 0;

                return (
                  <TooltipProvider key={hour}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "h-16 w-full rounded-md",
                              getColorIntensity(sessions, maxSessions)
                            )}
                          />
                          <span className="mt-1 text-xs text-muted-foreground">
                            {hour % 3 === 0 ? formatHour(hour) : ""}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getTooltipContent(itemData) ||
                          `${formatHour(hour)}: No data`}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[100px]">
              <p className="text-muted-foreground">No data available yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="minutes" className="mt-0">
          {showDayOfWeek ? (
            // Day of week heatmap for minutes
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Day labels */}
                <div className="flex mb-1">
                  <div className="w-12" /> {/* Spacer for hour labels */}
                  {days.map((day) => (
                    <div
                      key={day}
                      className="flex-1 text-xs text-muted-foreground text-center"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex">
                  {/* Hour labels */}
                  <div className="flex flex-col mr-2 w-10">
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <div
                        key={hour}
                        className="h-8 flex items-center justify-end text-xs text-muted-foreground"
                      >
                        {hour % 3 === 0 ? formatHour(hour) : ""}
                      </div>
                    ))}
                  </div>

                  {/* Cells */}
                  <div className="flex-1 grid grid-cols-7 gap-1">
                    {days.map((_, dayIndex) => (
                      <div key={dayIndex} className="flex flex-col gap-1">
                        {Array.from({ length: 24 }).map((_, hour) => {
                          const itemData = getItemData(hour, dayIndex);
                          const minutes = itemData?.totalMinutes || 0;

                          return (
                            <TooltipProvider key={`${dayIndex}-${hour}`}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "h-8 rounded-sm",
                                      getColorIntensity(minutes, maxMinutes)
                                    )}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  {getTooltipContent(itemData) ||
                                    `${days[dayIndex]}, ${formatHour(
                                      hour
                                    )}: No data`}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : // Hour of day heatmap for minutes
          data.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
              {Array.from({ length: 24 }).map((_, hour) => {
                const itemData = getItemData(hour);
                const minutes = itemData?.totalMinutes || 0;

                return (
                  <TooltipProvider key={hour}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "h-16 w-full rounded-md",
                              getColorIntensity(minutes, maxMinutes)
                            )}
                          />
                          <span className="mt-1 text-xs text-muted-foreground">
                            {hour % 3 === 0 ? formatHour(hour) : ""}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getTooltipContent(itemData) ||
                          `${formatHour(hour)}: No data`}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[100px]">
              <p className="text-muted-foreground">No data available yet</p>
            </div>
          )}
        </TabsContent>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Less productive
            </span>
            <div className="flex items-center gap-1">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((intensity) => (
                <div
                  key={intensity}
                  className={cn(
                    "h-3 w-3 rounded-sm",
                    `bg-primary/[${intensity.toFixed(2)}]`
                  )}
                />
              ))}
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
