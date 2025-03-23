"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Brain,
  Zap,
  BarChart,
  ListChecks,
  ArrowRight,
  Info,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CognitiveProfile } from "@/components/cognitive-enhancement/cognitive-profile";
import { CognitiveLoadChart } from "@/components/cognitive-enhancement/cognitive-load-chart";
import { CognitiveTaskInfo } from "@/components/tasks/cognitive-task-info";
import {
  useAdaptiveTaskScheduler,
  CognitiveTask,
  TimeBlock,
} from "@/lib/cognitive-enhancement/adaptive-task-scheduler";
import { useTasks, Task } from "@/hooks/use-tasks";
import { useSettings } from "@/lib/contexts/settings-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function CognitiveEnhancementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { settings } = useSettings();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledTasks, setScheduledTasks] = useState<
    { task: CognitiveTask; timeBlock: TimeBlock }[]
  >([]);

  const {
    estimateTaskComplexity,
    determineCognitiveLoadType,
    determineIdealEnergyLevel,
    generateTimeBlocks,
    scheduleTasks,
    createCognitiveProfile,
  } = useAdaptiveTaskScheduler();

  // Process tasks and generate schedule when tasks or selected date changes
  useEffect(() => {
    if (tasksLoading || !tasks || tasks.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Process tasks to add cognitive metadata
    const cognitiveTasksPromise = Promise.all(
      tasks
        .filter((task) => task.status !== "completed")
        .map(async (task) => {
          const complexity = estimateTaskComplexity(task);
          const cognitiveLoadType = determineCognitiveLoadType(task);
          const cognitiveTask: CognitiveTask = {
            ...task,
            complexity,
            cognitiveLoadType,
          };
          cognitiveTask.idealEnergyLevel =
            determineIdealEnergyLevel(cognitiveTask);
          return cognitiveTask;
        })
    );

    // Generate time blocks for the selected date
    const timeBlocksPromise = Promise.resolve(generateTimeBlocks(selectedDate));

    // Schedule tasks
    Promise.all([cognitiveTasksPromise, timeBlocksPromise])
      .then(([cognitiveTasks, timeBlocks]) => {
        const scheduled = scheduleTasks(cognitiveTasks, timeBlocks);
        setScheduledTasks(scheduled);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error scheduling tasks:", error);
        setIsLoading(false);
      });
  }, [tasks, selectedDate, tasksLoading]);

  // Group scheduled tasks by hour
  const groupedTasks = scheduledTasks.reduce((acc, { task, timeBlock }) => {
    const hour = timeBlock.startTime.getHours();
    const hourKey = `${hour}:00`;

    if (!acc[hourKey]) {
      acc[hourKey] = [];
    }

    acc[hourKey].push({ task, timeBlock });
    return acc;
  }, {} as Record<string, { task: CognitiveTask; timeBlock: TimeBlock }[]>);

  // If not authenticated, show login message
  if (authLoading) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-[400px] w-full rounded-md" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to access the cognitive enhancement features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Cognitive Enhancement
            </h1>
            <p className="text-muted-foreground">
              Optimize your productivity based on cognitive science
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            >
              Previous Day
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              Next Day
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cognitive Profile */}
          <div className="md:col-span-1">
            <CognitiveProfile
              initialProfile={createCognitiveProfile()}
              onSave={(profile) => {
                // Re-generate schedule with new profile
                const timeBlocks = generateTimeBlocks(selectedDate);
                const cognitiveTasks = tasks
                  .filter((task) => task.status !== "completed")
                  .map((task) => {
                    const complexity = estimateTaskComplexity(task);
                    const cognitiveLoadType = determineCognitiveLoadType(task);
                    const cognitiveTask: CognitiveTask = {
                      ...task,
                      complexity,
                      cognitiveLoadType,
                    };
                    cognitiveTask.idealEnergyLevel =
                      determineIdealEnergyLevel(cognitiveTask);
                    return cognitiveTask;
                  });

                const scheduled = scheduleTasks(cognitiveTasks, timeBlocks);
                setScheduledTasks(scheduled);
              }}
            />
          </div>

          {/* Cognitive Load Chart */}
          <div className="md:col-span-2">
            <CognitiveLoadChart
              scheduledTasks={scheduledTasks}
              date={selectedDate}
            />
          </div>
        </div>

        {/* Adaptive Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Adaptive Schedule</CardTitle>
              </div>
              <p className="text-sm font-medium">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <CardDescription>
              Tasks scheduled based on your cognitive profile and energy levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : Object.keys(groupedTasks).length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  No tasks scheduled for this day
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => (window.location.href = "/app/tasks")}
                >
                  Add Tasks
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedTasks)
                  .sort(([hourA], [hourB]) => {
                    const hourNumA = parseInt(hourA.split(":")[0]);
                    const hourNumB = parseInt(hourB.split(":")[0]);
                    return hourNumA - hourNumB;
                  })
                  .map(([hour, tasks]) => (
                    <div key={hour} className="space-y-2">
                      <h3 className="text-lg font-medium">{hour}</h3>
                      <div className="space-y-2">
                        {tasks.map(({ task, timeBlock }) => (
                          <Card key={task.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm text-muted-foreground">
                                  {format(timeBlock.startTime, "h:mm a")} -{" "}
                                  {format(timeBlock.endTime, "h:mm a")}
                                </div>
                                <div className="flex items-center gap-1">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      timeBlock.energyLevel === "high"
                                        ? "bg-purple-500"
                                        : timeBlock.energyLevel === "medium"
                                        ? "bg-blue-500"
                                        : "bg-teal-500"
                                    }`}
                                  />
                                  <span className="text-xs capitalize">
                                    {timeBlock.energyLevel}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <CognitiveTaskInfo
                                task={task}
                                showLabels={true}
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cognitive Enhancement Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Cognitive Enhancement Insights</CardTitle>
            </div>
            <CardDescription>
              AI-powered insights to help you optimize your cognitive
              performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="focus">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="focus">
                  <Zap className="h-4 w-4 mr-2" />
                  Focus
                </TabsTrigger>
                <TabsTrigger value="productivity">
                  <BarChart className="h-4 w-4 mr-2" />
                  Productivity
                </TabsTrigger>
                <TabsTrigger value="tasks">
                  <ListChecks className="h-4 w-4 mr-2" />
                  Task Management
                </TabsTrigger>
              </TabsList>

              <TabsContent value="focus" className="space-y-4 mt-4">
                <Alert>
                  <div className="flex items-start">
                    <Brain className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                    <div>
                      <AlertTitle>Focus Optimization</AlertTitle>
                      <AlertDescription>
                        Based on your cognitive profile and task history, your
                        peak focus hours appear to be between 9:00 AM and 11:00
                        AM. Consider scheduling your most complex and
                        focus-intensive tasks during this period.
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>

                <Alert>
                  <div className="flex items-start">
                    <Zap className="h-5 w-5 mr-2 mt-0.5 text-yellow-500" />
                    <div>
                      <AlertTitle>Context Switching</AlertTitle>
                      <AlertDescription>
                        You appear to lose approximately 20 minutes of
                        productive time when switching between different types
                        of tasks. Try grouping similar tasks together to
                        minimize context switching costs.
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              </TabsContent>

              <TabsContent value="productivity" className="space-y-4 mt-4">
                <Alert>
                  <div className="flex items-start">
                    <BarChart className="h-5 w-5 mr-2 mt-0.5 text-green-500" />
                    <div>
                      <AlertTitle>Productivity Patterns</AlertTitle>
                      <AlertDescription>
                        Your productivity tends to dip after lunch (1:00 PM -
                        2:00 PM). Consider scheduling lighter, more routine
                        tasks during this period, or taking a short walk to
                        boost your energy levels.
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4 mt-4">
                <Alert>
                  <div className="flex items-start">
                    <ListChecks className="h-5 w-5 mr-2 mt-0.5 text-indigo-500" />
                    <div>
                      <AlertTitle>Task Complexity</AlertTitle>
                      <AlertDescription>
                        You currently have{" "}
                        {tasks?.filter(
                          (t) => estimateTaskComplexity(t) === "high"
                        ).length || 0}{" "}
                        high-complexity tasks in your queue. Consider breaking
                        these down into smaller, more manageable subtasks to
                        reduce cognitive load.
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
