"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  subMonths,
  addMonths,
  isToday,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StreakCalendarProps {
  data: Array<{
    date: string | Date;
    focusMinutes?: number;
    completedSessions?: number;
    completedTasks?: number;
  }>;
  title?: string;
  description?: string;
}

export function StreakCalendar({
  data = [],
  title = "Focus Streak",
  description = "Your daily focus activity",
}: StreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Convert all dates to Date objects
  const activeDates = data.map((item) => ({
    ...item,
    date: new Date(item.date),
    focusMinutes: item.focusMinutes || 0,
    completedSessions: item.completedSessions || 0,
    completedTasks: item.completedTasks || 0,
  }));

  // Get days in the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the maximum values for normalization
  const maxFocusMinutes = Math.max(
    ...activeDates.map((d) => d.focusMinutes),
    60
  ); // Default to 60 minutes if no data
  const maxCompletedSessions = Math.max(
    ...activeDates.map((d) => d.completedSessions),
    4
  ); // Default to 4 sessions if no data
  const maxCompletedTasks = Math.max(
    ...activeDates.map((d) => d.completedTasks),
    5
  ); // Default to 5 tasks if no data

  // Get activity level for a day (0-4)
  const getActivityLevel = (date: Date) => {
    const dayData = activeDates.find((d) => isSameDay(d.date, date));

    if (!dayData) return 0;

    // Calculate activity score based on focus minutes, completed sessions, and tasks
    const focusScore =
      Math.min(dayData.focusMinutes / maxFocusMinutes, 1) * 0.5;
    const sessionScore =
      Math.min(dayData.completedSessions / maxCompletedSessions, 1) * 0.3;
    const taskScore =
      Math.min(dayData.completedTasks / maxCompletedTasks, 1) * 0.2;

    const totalScore = focusScore + sessionScore + taskScore;

    // Convert to level 0-4
    if (totalScore === 0) return 0;
    if (totalScore < 0.25) return 1;
    if (totalScore < 0.5) return 2;
    if (totalScore < 0.75) return 3;
    return 4;
  };

  // Get color class based on activity level
  const getActivityColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-muted/20";
      case 1:
        return "bg-primary/20";
      case 2:
        return "bg-primary/40";
      case 3:
        return "bg-primary/60";
      case 4:
        return "bg-primary/90";
      default:
        return "bg-muted/20";
    }
  };

  // Get tooltip content for a day
  const getDayTooltip = (date: Date) => {
    const dayData = activeDates.find((d) => isSameDay(d.date, date));

    if (!dayData) return "No activity";

    const focusHours = Math.floor(dayData.focusMinutes / 60);
    const focusMinutes = dayData.focusMinutes % 60;
    const focusTimeStr =
      focusHours > 0 ? `${focusHours}h ${focusMinutes}m` : `${focusMinutes}m`;

    return `
      ${format(date, "MMM d, yyyy")}
      Focus time: ${focusTimeStr}
      Completed sessions: ${dayData.completedSessions}
      Completed tasks: ${dayData.completedTasks}
    `;
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Get current streak
  const getCurrentStreak = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = today;

    while (true) {
      const dayData = activeDates.find((d) => isSameDay(d.date, currentDate));
      if (!dayData || getActivityLevel(currentDate) === 0) break;

      streak++;
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  // Get longest streak
  const getLongestStreak = () => {
    let longestStreak = 0;
    let currentStreak = 0;

    // Sort dates in ascending order
    const sortedDates = [...activeDates].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i].date;
      const activityLevel = getActivityLevel(currentDate);

      if (activityLevel > 0) {
        // Check if this is consecutive with the previous date
        if (i > 0) {
          const prevDate = sortedDates[i - 1].date;
          const dayDiff = Math.round(
            (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (dayDiff === 1) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 0;
      }

      longestStreak = Math.max(longestStreak, currentStreak);
    }

    return longestStreak;
  };

  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <span className="text-sm font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8"
            disabled={isSameMonth(currentMonth, new Date())}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-7 gap-1 text-center text-xs">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Fill in empty cells for days before the start of the month */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-start-${index}`} className="h-9" />
          ))}

          {/* Render days of the month */}
          {monthDays.map((day) => {
            const activityLevel = getActivityLevel(day);
            const isCurrentDay = isToday(day);

            return (
              <TooltipProvider key={day.toISOString()}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex h-9 items-center justify-center rounded-md text-xs",
                        getActivityColor(activityLevel),
                        isCurrentDay && "ring-2 ring-primary"
                      )}
                    >
                      {format(day, "d")}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="whitespace-pre-line">
                      {getDayTooltip(day)}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}

          {/* Fill in empty cells for days after the end of the month */}
          {Array.from({
            length: 6 - monthEnd.getDay(),
          }).map((_, index) => (
            <div key={`empty-end-${index}`} className="h-9" />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">Activity Levels:</div>
            <div className="flex items-center space-x-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn("h-4 w-4 rounded-sm", getActivityColor(level))}
                />
              ))}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-3 w-3" />
                    <span className="sr-only">Activity info</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Activity level is based on focus time, completed sessions,
                    and tasks
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{currentStreak}</div>
              <div className="text-xs text-muted-foreground">
                Current Streak
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{longestStreak}</div>
              <div className="text-xs text-muted-foreground">
                Longest Streak
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
