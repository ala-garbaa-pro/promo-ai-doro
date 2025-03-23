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
  Calendar,
  ChevronDown,
  Clock,
  CheckCircle,
  ListChecks,
  TrendingUp,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import {
  DynamicFocusTimeChart,
  DynamicTaskCompletionChart,
  DynamicProductivityHeatmap
} from "@/components/analytics/dynamic-charts";
import { FocusScoreGauge } from "@/components/analytics/focus-score-gauge";
import { StreakCalendar } from "@/components/analytics/streak-calendar";
import { AIInsights } from "@/components/analytics/ai-insights";
import { ComparativeChart } from "@/components/analytics/comparative-chart";
import { AnimatedTransition } from "@/components/ui/animated-transition";
import { AnimatedList } from "@/components/ui/animated-list";

export default function AnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      // Calculate date range
      const now = new Date();
      let endpoint = "/api/analytics/monthly";

      if (timeRange === "week") {
        endpoint = "/api/analytics/weekly";
      } else if (timeRange === "year") {
        endpoint = "/api/analytics/yearly";
      }

      const response = await fetch(`${endpoint}?date=${now.toISOString()}&includeComparison=true`);

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const data = await response.json();

      // Add some mock data for the new components if not provided by the API
      if (!data.previousAvgFocusScore && data.avgFocusScore) {
        data.previousAvgFocusScore = Math.max(0, data.avgFocusScore - 5 + Math.floor(Math.random() * 10));
      }

      if (!data.previousPeriodAnalytics && data.dailyAnalytics) {
        data.previousPeriodAnalytics = data.dailyAnalytics.map((day: any) => ({
          ...day,
          totalFocusMinutes: Math.max(0, day.totalFocusMinutes * (0.8 + Math.random() * 0.4)),
          completedSessions: Math.max(0, day.completedSessions - 1 + Math.floor(Math.random() * 3)),
          completedTasks: Math.max(0, day.completedTasks - 1 + Math.floor(Math.random() * 3))
        }));
      }

      if (!data.productivityByHourAndDay && data.productivityByHour) {
        data.productivityByHourAndDay = [];
        for (let day = 0; day < 7; day++) {
          for (let hour = 0; hour < 24; hour++) {
            const hourData = data.productivityByHour.find((h: any) => h.hour === hour);
            if (hourData && Math.random() > 0.7) {
              data.productivityByHourAndDay.push({
                day,
                hour,
                completedSessions: Math.floor(hourData.completedSessions * (0.5 + Math.random())),
                totalMinutes: Math.floor(hourData.totalMinutes * (0.5 + Math.random()))
              });
            }
          }
        }
      }

      // Add mock data for AI insights if not provided
      if (data.totalWorkSessions > 5) {
        data.focusScoreTrend = data.avgFocusScore > (data.previousAvgFocusScore || 0) ? 'increasing' : 'decreasing';
        data.focusScoreChange = Math.abs(data.avgFocusScore - (data.previousAvgFocusScore || 0));
        data.sessionCompletionRate = Math.round(data.completedSessions / (data.completedSessions + data.abandonedSessions) * 100) || 75;
        data.optimalSessionLength = 25 + Math.floor(Math.random() * 10) * 5;
        data.consistencyStreak = Math.floor(Math.random() * 14) + 1;
        data.timeOfDayPattern = ['morning', 'afternoon', 'evening'][Math.floor(Math.random() * 3)];
        data.weekdayVsWeekend = Math.random() > 0.5 ? 'weekday' : 'weekend';
        data.taskCompletionRate = Math.round(Math.random() * 30 + 60);
      }

      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch analytics on mount and when time range changes
  useEffect(() => {

    fetchAnalytics();
  }, [isAuthenticated, timeRange]);

  // Format minutes to hours and minutes
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="container mx-auto p-6">
      <AnimatedTransition type="slide-down" duration={0.4}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track your productivity metrics and insights
            </p>
          </div>

        <div className="flex items-center gap-2">
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-auto">
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </AnimatedTransition>

      {error && (
        <AnimatedTransition type="slide-up" duration={0.3}>
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </AnimatedTransition>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full mb-6">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="focus" className="flex-1">
            Focus Time
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex-1">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex-1">
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AnimatedList
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            animation="slide-up"
            staggerDelay={0.1}
          >
            <MetricCard
              title="Total Focus Time"
              value={analytics ? formatMinutes(analytics.totalWorkMinutes || 0) : "0h 0m"}
              description={`This ${timeRange}`}
              icon={<Clock className="h-5 w-5" />}
              color="bg-primary/10 text-primary"
            />
            <MetricCard
              title="Completed Sessions"
              value={analytics ? (analytics.completedWorkSessions || 0).toString() : "0"}
              description={`This ${timeRange}`}
              icon={<CheckCircle className="h-5 w-5" />}
              color="bg-green-500/10 text-green-500"
            />
            <MetricCard
              title="Completed Tasks"
              value={analytics ? (analytics.completedTasks || 0).toString() : "0"}
              description={`This ${timeRange}`}
              icon={<ListChecks className="h-5 w-5" />}
              color="bg-purple-500/10 text-purple-500"
            />
            <MetricCard
              title="Average Focus Score"
              value={analytics && analytics.avgFocusScore ? analytics.avgFocusScore.toString() : "--"}
              description={`This ${timeRange}`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="bg-blue-500/10 text-blue-500"
            />
          </AnimatedList>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Daily Focus Time</CardTitle>
                <CardDescription>
                  Hours spent focusing each day
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics && analytics.dailyAnalytics && analytics.dailyAnalytics.length > 0 ? (
                  <DynamicFocusTimeChart data={analytics.dailyAnalytics} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">No data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Completion</CardTitle>
                <CardDescription>
                  Tasks completed over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics && analytics.dailyAnalytics && analytics.dailyAnalytics.length > 0 ? (
                  <DynamicTaskCompletionChart data={analytics.dailyAnalytics} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">No data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <AIInsights
            data={analytics || {}}
            isLoading={isLoading}
            onRefreshInsights={async () => {
              setIsLoading(true);
              await fetchAnalytics();
            }}
          />
        </TabsContent>

        <TabsContent value="focus">
          {analytics && analytics.totalWorkSessions > 0 ? (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FocusScoreGauge
                  score={analytics.avgFocusScore || 0}
                  previousScore={analytics.previousAvgFocusScore}
                  title="Focus Score"
                  description="Your focus effectiveness score"
                />

                <StreakCalendar
                  data={analytics.dailyAnalytics?.map((day: any) => ({
                    date: day.date,
                    focusMinutes: day.totalFocusMinutes,
                    completedSessions: day.completedSessions,
                    completedTasks: day.completedTasks
                  })) || []}
                  title="Focus Streak"
                  description="Your daily focus activity"
                />
              </div>

              <DynamicFocusTimeChart
                data={analytics.dailyAnalytics}
                title="Focus Time Distribution"
                description="Your focus time patterns over time"
              />

              <div className="grid gap-6 md:grid-cols-2">
                <ComparativeChart
                  currentData={analytics.dailyAnalytics?.slice(-7) || []}
                  previousData={analytics.previousPeriodAnalytics?.slice(-7) || []}
                  dataKey="totalFocusMinutes"
                  title="Focus Time Comparison"
                  description="Compare with previous period"
                  valueFormatter={(value) => `${Math.round(value)} min`}
                  dateKey="date"
                  comparisonType="week"
                />

                <DynamicProductivityHeatmap
                  data={analytics.productivityByHour || []}
                  title="Productivity Heatmap"
                  description="Your most productive hours of the day"
                  showDayOfWeek={analytics.productivityByHourAndDay && analytics.productivityByHourAndDay.length > 0}
                />
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Focus time analytics will be available after you complete your
                  first focus session
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tasks">
          {analytics && analytics.completedTasks > 0 ? (
            <div className="space-y-6">
              <DynamicTaskCompletionChart
                data={analytics.dailyAnalytics}
                title="Task Completion Trends"
                description="Your task completion patterns over time"
              />

              <Card>
                <CardHeader>
                  <CardTitle>Task Completion Rate</CardTitle>
                  <CardDescription>Your task completion efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="text-4xl font-bold">{analytics.completedTasks}</div>
                          <p className="text-sm text-muted-foreground">Tasks Completed</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="text-4xl font-bold">
                            {analytics.totalWorkSessions > 0
                              ? Math.round((analytics.completedTasks / analytics.totalWorkSessions) * 100) / 100
                              : 0}
                          </div>
                          <p className="text-sm text-muted-foreground">Tasks Per Session</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="text-4xl font-bold">
                            {analytics.totalWorkMinutes > 0
                              ? Math.round((analytics.totalWorkMinutes / analytics.completedTasks) * 10) / 10
                              : 0}
                          </div>
                          <p className="text-sm text-muted-foreground">Minutes Per Task</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Task Insights</CardTitle>
                  <CardDescription>Personalized insights based on your task patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
                      <p className="text-sm">
                        You've completed <span className="font-medium">{analytics.completedTasks}</span> tasks
                        {timeRange === "week" ? "this week" : timeRange === "month" ? "this month" : "this year"}.
                        {analytics.completedTasks > 10
                          ? "Great job staying productive!"
                          : "Keep going to increase your productivity!"}
                      </p>
                    </div>

                    {analytics.totalWorkMinutes > 0 && analytics.completedTasks > 0 && (
                      <div className="rounded-lg bg-blue-500/5 p-4 border border-blue-500/10">
                        <p className="text-sm">
                          On average, you spend <span className="font-medium">
                            {Math.round((analytics.totalWorkMinutes / analytics.completedTasks) * 10) / 10}
                          </span> minutes per completed task.
                          {(analytics.totalWorkMinutes / analytics.completedTasks) > 45
                            ? "Consider breaking down complex tasks into smaller ones for better focus."
                            : "You're efficiently completing tasks in manageable time chunks."}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Task analytics will be available after you complete your first
                  task
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends">
          {analytics && (analytics.totalWorkSessions > 10 || analytics.completedTasks > 10) ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Productivity Trends</CardTitle>
                  <CardDescription>Your productivity patterns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-2">
                          <h3 className="text-lg font-medium">Focus Time</h3>
                          <div className="flex items-center">
                            <div className="text-2xl font-bold">
                              {Math.round(analytics.totalWorkMinutes / 60 * 10) / 10}
                            </div>
                            <span className="text-sm text-muted-foreground ml-2">hours</span>

                            {analytics.previousPeriodWorkMinutes && (
                              <div className="ml-auto flex items-center">
                                {analytics.totalWorkMinutes > analytics.previousPeriodWorkMinutes ? (
                                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                ) : (
                                  <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />
                                )}
                                <span className="text-sm">
                                  {Math.abs(Math.round((analytics.totalWorkMinutes - analytics.previousPeriodWorkMinutes) / analytics.previousPeriodWorkMinutes * 100))}%
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {timeRange === "week" ? "This week" : timeRange === "month" ? "This month" : "This year"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-2">
                          <h3 className="text-lg font-medium">Completed Tasks</h3>
                          <div className="flex items-center">
                            <div className="text-2xl font-bold">
                              {analytics.completedTasks}
                            </div>
                            <span className="text-sm text-muted-foreground ml-2">tasks</span>

                            {analytics.previousPeriodCompletedTasks && (
                              <div className="ml-auto flex items-center">
                                {analytics.completedTasks > analytics.previousPeriodCompletedTasks ? (
                                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                ) : (
                                  <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />
                                )}
                                <span className="text-sm">
                                  {Math.abs(Math.round((analytics.completedTasks - analytics.previousPeriodCompletedTasks) / analytics.previousPeriodCompletedTasks * 100))}%
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {timeRange === "week" ? "This week" : timeRange === "month" ? "This month" : "This year"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Productivity Score</CardTitle>
                  <CardDescription>Your overall productivity rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="relative h-36 w-36 mb-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl font-bold">
                          {analytics.avgFocusScore || 0}
                        </div>
                      </div>
                      <svg className="h-full w-full" viewBox="0 0 100 100">
                        <circle
                          className="text-muted stroke-current"
                          strokeWidth="10"
                          strokeLinecap="round"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                        <circle
                          className="text-primary stroke-current"
                          strokeWidth="10"
                          strokeLinecap="round"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - (analytics.avgFocusScore || 0) / 100)}`}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                    <p className="text-center text-sm text-muted-foreground max-w-md">
                      {analytics.avgFocusScore ? (
                        analytics.avgFocusScore > 80 ? (
                          "Excellent productivity! You're consistently maintaining focus and completing tasks efficiently."
                        ) : analytics.avgFocusScore > 60 ? (
                          "Good productivity. You're on the right track, but there's room for improvement in your focus sessions."
                        ) : (
                          "Your productivity score indicates there's significant room for improvement. Try to minimize interruptions and complete more focus sessions."
                        )
                      ) : (
                        "Complete more focus sessions to calculate your productivity score."
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Productivity Recommendations</CardTitle>
                  <CardDescription>Personalized suggestions to improve your productivity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
                      <h3 className="text-sm font-medium mb-2">Optimize Your Schedule</h3>
                      <p className="text-sm">
                        Based on your productivity patterns, consider scheduling your most important tasks
                        {analytics.mostProductiveTimeStart ?
                          ` between ${format(new Date(analytics.mostProductiveTimeStart), 'h:mm a')} and ${format(new Date(analytics.mostProductiveTimeEnd), 'h:mm a')}` :
                          " in the morning"} when your focus is at its peak.
                      </p>
                    </div>

                    <div className="rounded-lg bg-blue-500/5 p-4 border border-blue-500/10">
                      <h3 className="text-sm font-medium mb-2">Improve Your Focus</h3>
                      <p className="text-sm">
                        {analytics.avgFocusScore && analytics.avgFocusScore < 70 ?
                          "Try to minimize interruptions during your focus sessions. Consider using the 'Do Not Disturb' mode on your devices." :
                          "You're maintaining good focus during your sessions. To further improve, try increasing the duration of your focus sessions gradually."}
                      </p>
                    </div>

                    <div className="rounded-lg bg-green-500/5 p-4 border border-green-500/10">
                      <h3 className="text-sm font-medium mb-2">Task Management</h3>
                      <p className="text-sm">
                        {analytics.completedTasks > 20 ?
                          "You're completing tasks efficiently. Consider categorizing your tasks by priority to focus on high-impact activities first." :
                          "Break down larger tasks into smaller, manageable subtasks to make progress more visible and maintain motivation."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Trend analytics will be available after you use the app for a
                  while
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      )}
      </Tabs>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, description, color, icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div
            className={`h-10 w-10 rounded-full ${color} flex items-center justify-center`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
