"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Loader2,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { cn } from "@/lib/utils";
import { useTasks, Task } from "@/hooks/use-tasks";
import { useAuth } from "@/components/auth/auth-provider";

export default function CalendarPage() {
  const { isAuthenticated } = useAuth();
  const { tasks, isLoading } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({});

  // Generate calendar days for the current month
  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    setCalendarDays(days);
  }, [currentDate]);

  // Group tasks by date
  useEffect(() => {
    const grouped: Record<string, Task[]> = {};

    tasks.forEach((task) => {
      if (task.dueDate) {
        const dateStr =
          typeof task.dueDate === "string"
            ? task.dueDate.split("T")[0]
            : format(task.dueDate, "yyyy-MM-dd");

        if (!grouped[dateStr]) {
          grouped[dateStr] = [];
        }
        grouped[dateStr].push(task);
      }
    });

    setTasksByDate(grouped);
  }, [tasks]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Navigate to current month
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    const dateStr = formatDate(day);
    return tasksByDate[dateStr] || [];
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Calendar</h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center py-2 font-medium text-sm">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const dayTasks = getTasksForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={index}
                    className={cn(
                      "min-h-[100px] p-2 border rounded-md",
                      !isCurrentMonth && "opacity-40",
                      isCurrentDay && "border-primary"
                    )}
                  >
                    <div className="text-right mb-1">
                      <span
                        className={cn(
                          "inline-block w-6 h-6 rounded-full text-center text-sm",
                          isCurrentDay && "bg-primary text-primary-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "text-xs p-1 rounded truncate",
                            task.status === "completed"
                              ? "bg-green-100 dark:bg-green-900/20"
                              : "bg-primary/10"
                          )}
                        >
                          {task.title}
                        </div>
                      ))}

                      {dayTasks.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming Tasks</h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(tasksByDate)
              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
              .slice(0, 5)
              .map(([dateStr, dateTasks]) => (
                <Card key={dateStr}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {format(parseISO(dateStr), "EEEE, MMMM d, yyyy")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {dateTasks.map((task) => (
                        <li key={task.id} className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-1 h-full rounded-full self-stretch",
                              task.priority === "high"
                                ? "bg-red-500"
                                : task.priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            )}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3
                                className={cn(
                                  "text-sm font-medium",
                                  task.status === "completed" &&
                                    "line-through text-muted-foreground"
                                )}
                              >
                                {task.title}
                              </h3>
                              {task.estimatedPomodoros && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {task.estimatedPomodoros}
                                </div>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}

            {Object.keys(tasksByDate).length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No upcoming tasks with due dates
                  </p>
                  <Button className="mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task with Due Date
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
