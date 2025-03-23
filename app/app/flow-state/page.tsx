"use client";

import { useState, useEffect } from "react";
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
  Brain,
  Zap,
  BarChart,
  Clock,
  BookOpen,
  Coffee,
  Info,
  ArrowRight,
} from "lucide-react";
import { FlowStateIndicator } from "@/components/cognitive-enhancement/flow-state-indicator";
import { FocusModeToggle } from "@/components/cognitive-enhancement/focus-mode-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  getFlowStateSessionsForCurrentUser,
  getFlowStateStatisticsForCurrentUser,
} from "@/lib/server/actions/flow-state-actions";
import { formatDuration } from "@/lib/utils";

export default function FlowStatePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [flowSessions, setFlowSessions] = useState<any[]>([]);
  const [flowStats, setFlowStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch flow state sessions and statistics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [sessionsResult, statsResult] = await Promise.all([
          getFlowStateSessionsForCurrentUser(10),
          getFlowStateStatisticsForCurrentUser(),
        ]);

        if (sessionsResult.success && sessionsResult.data) {
          setFlowSessions(sessionsResult.data);
        }

        if (statsResult.success && statsResult.data) {
          setFlowStats(statsResult.data);
        }
      } catch (error) {
        console.error("Error fetching flow state data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Flow State Optimization</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and optimize your flow state for maximum productivity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                <Brain className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="insights">
                <Zap className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="history">
                <BarChart className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <CardTitle>What is Flow State?</CardTitle>
                  </div>
                  <CardDescription>
                    Understanding the science behind optimal productivity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Flow state, often described as being "in the zone," is a
                    mental state where you are fully immersed and focused on a
                    task, with a feeling of energized focus and enjoyment in the
                    process.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Time Dilation</h3>
                        <p className="text-sm text-muted-foreground">
                          Time seems to pass differently, either faster or
                          slower than normal.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 flex-shrink-0">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">
                          Complete Concentration
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Full focus on the task with minimal distraction.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300 flex-shrink-0">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">
                          Intrinsic Motivation
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          The activity becomes rewarding in itself.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-300 flex-shrink-0">
                        <Coffee className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Reduced Fatigue</h3>
                        <p className="text-sm text-muted-foreground">
                          Mental energy is sustained for longer periods.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>New Feature</AlertTitle>
                <AlertDescription>
                  Flow state detection is currently in beta. The more you use
                  it, the more accurate it becomes at identifying your personal
                  flow patterns.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Flow Triggers</CardTitle>
                    <CardDescription>
                      Common activities that help induce flow state
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                        <span>
                          <strong>Clear goals</strong>: Define specific
                          objectives before starting work
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                        <span>
                          <strong>Immediate feedback</strong>: Create systems to
                          see your progress
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                        <span>
                          <strong>Challenge-skill balance</strong>: Tasks should
                          be challenging but achievable
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                        <span>
                          <strong>Distraction-free environment</strong>:
                          Minimize interruptions
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Optimize Your Environment
                    </CardTitle>
                    <CardDescription>
                      Set up your workspace for flow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                        <span>
                          <strong>Ambient noise</strong>: Use background sounds
                          that help you focus
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                        <span>
                          <strong>Lighting</strong>: Ensure proper lighting to
                          reduce eye strain
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                        <span>
                          <strong>Notifications</strong>: Turn off all
                          non-essential alerts
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                        <span>
                          <strong>Comfort</strong>: Ensure your physical comfort
                          to avoid distractions
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6 mt-6">
              {!flowStats || flowStats.totalSessions < 3 ? (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Collecting Data</AlertTitle>
                    <AlertDescription>
                      We're currently collecting data about your flow patterns.
                      More insights will be available as you use the app.
                    </AlertDescription>
                  </Alert>

                  <Card>
                    <CardHeader>
                      <CardTitle>Your Flow Patterns</CardTitle>
                      <CardDescription>
                        Insights based on your usage patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <BarChart className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          Not enough data yet
                        </h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                          Continue using the app to generate insights about your
                          flow state patterns and optimal work conditions.
                        </p>
                        <Button>Start a Focus Session</Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Flow State Insights</CardTitle>
                      <CardDescription>
                        Patterns and trends from your flow sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-3">
                            Flow State Distribution
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                                  <span className="font-medium">
                                    Light Flow
                                  </span>
                                </div>
                                <span className="text-2xl font-bold">
                                  {flowStats.sessionsByLevel.light || 0}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {flowStats.totalSessions > 0
                                  ? `${Math.round(
                                      ((flowStats.sessionsByLevel.light || 0) /
                                        flowStats.totalSessions) *
                                        100
                                    )}% of sessions`
                                  : "No sessions"}
                              </p>
                            </div>

                            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                                  <span className="font-medium">Deep Flow</span>
                                </div>
                                <span className="text-2xl font-bold">
                                  {flowStats.sessionsByLevel.deep || 0}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {flowStats.totalSessions > 0
                                  ? `${Math.round(
                                      ((flowStats.sessionsByLevel.deep || 0) /
                                        flowStats.totalSessions) *
                                        100
                                    )}% of sessions`
                                  : "No sessions"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-3">
                            Performance Metrics
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">
                                  Average Focus Score
                                </span>
                                <span className="text-sm font-medium">
                                  {flowStats.avgFocusScore}/100
                                </span>
                              </div>
                              <Progress
                                value={flowStats.avgFocusScore}
                                className="h-2"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">
                                  Maximum Focus Score
                                </span>
                                <span className="text-sm font-medium">
                                  {flowStats.maxFocusScore}/100
                                </span>
                              </div>
                              <Progress
                                value={flowStats.maxFocusScore}
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-3">
                            Flow Duration
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Average Session
                              </p>
                              <p className="text-2xl font-bold">
                                {formatDuration(flowStats.avgDuration)}
                              </p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Total Flow Time
                              </p>
                              <p className="text-2xl font-bold">
                                {formatDuration(flowStats.totalDuration)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Flow State Recommendations</CardTitle>
                      <CardDescription>
                        Personalized suggestions to improve your flow state
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            Optimal Session Length
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Your flow sessions average{" "}
                            {formatDuration(flowStats.avgDuration)}. Consider
                            setting your work sessions to{" "}
                            {Math.ceil(flowStats.avgDuration / 60) * 5} minutes
                            to align with your natural flow rhythm.
                          </p>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            Flow State Potential
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Your maximum focus score of{" "}
                            {flowStats.maxFocusScore} shows you have strong
                            potential for deep flow states.
                            {flowStats.avgFocusScore < 70
                              ? "Try to minimize distractions to maintain this state longer."
                              : "You're consistently achieving good flow states!"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6 mt-6">
              {flowSessions.length === 0 ? (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Flow History</AlertTitle>
                    <AlertDescription>
                      Your flow state history will be displayed here as you use
                      the app.
                    </AlertDescription>
                  </Alert>

                  <Card>
                    <CardHeader>
                      <CardTitle>Flow State History</CardTitle>
                      <CardDescription>
                        Track your flow state over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Clock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          No history available
                        </h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                          Your flow state history will appear here after you've
                          completed some focus sessions.
                        </p>
                        <Button>Start Tracking</Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Flow State History</CardTitle>
                      <CardDescription>
                        Your recent flow state sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {flowSessions.map((session) => {
                          const startDate = new Date(session.startTime);
                          const endDate = session.endTime
                            ? new Date(session.endTime)
                            : null;

                          // Determine flow state color
                          let stateColor = "bg-gray-500";
                          if (session.flowStateLevel === "deep")
                            stateColor = "bg-purple-500";
                          if (session.flowStateLevel === "light")
                            stateColor = "bg-blue-500";
                          if (session.flowStateLevel === "entering")
                            stateColor = "bg-green-500";
                          if (session.flowStateLevel === "exiting")
                            stateColor = "bg-yellow-500";

                          return (
                            <div
                              key={session.id}
                              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`h-3 w-3 rounded-full ${stateColor}`}
                                  />
                                  <span className="font-medium capitalize">
                                    {session.flowStateLevel} Flow
                                  </span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {startDate.toLocaleDateString()} at{" "}
                                  {startDate.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Duration
                                  </p>
                                  <p className="font-medium">
                                    {formatDuration(session.duration || 0)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Focus Score
                                  </p>
                                  <p className="font-medium">
                                    {session.maxFocusScore}/100
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {flowStats && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Flow Statistics</CardTitle>
                        <CardDescription>
                          Summary of your flow state performance
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Total Sessions
                            </p>
                            <p className="text-2xl font-bold">
                              {flowStats.totalSessions}
                            </p>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Total Flow Time
                            </p>
                            <p className="text-2xl font-bold">
                              {formatDuration(flowStats.totalDuration)}
                            </p>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Avg. Session
                            </p>
                            <p className="text-2xl font-bold">
                              {formatDuration(flowStats.avgDuration)}
                            </p>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Max Focus Score
                            </p>
                            <p className="text-2xl font-bold">
                              {flowStats.maxFocusScore}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <FlowStateIndicator showDetails={true} />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Flow Protection</CardTitle>
              <CardDescription>
                Tools to help maintain your flow state
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FocusModeToggle />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
