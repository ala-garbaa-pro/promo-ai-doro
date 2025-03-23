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

export default function AnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Fetch analytics data
  useEffect(() => {
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

        const response = await fetch(`${endpoint}?date=${now.toISOString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

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
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Daily Focus Time</CardTitle>
                <CardDescription>
                  Hours spent focusing each day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  {analytics && analytics.dailyAnalytics && analytics.dailyAnalytics.length > 0 ? (
                    <div className="w-full h-full">
                      {/* Chart would go here */}
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Chart visualization coming soon</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No data available yet</p>
                  )}
                </div>
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
                <div className="h-[300px] flex items-center justify-center">
                  {analytics && analytics.dailyAnalytics && analytics.dailyAnalytics.length > 0 ? (
                    <div className="w-full h-full">
                      {/* Chart would go here */}
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Chart visualization coming soon</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No data available yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                AI Productivity Insights
              </CardTitle>
              <CardDescription>
                Personalized recommendations based on your work patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics && analytics.totalWorkSessions > 5 ? (
                  <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
                    <p className="text-sm">
                      Based on your work patterns, you seem to be most productive between
                      {analytics.mostProductiveTimeStart ?
                        ` ${format(new Date(analytics.mostProductiveTimeStart), 'h:mm a')} and ${format(new Date(analytics.mostProductiveTimeEnd), 'h:mm a')}` :
                        " 9:00 AM and 11:00 AM"}.
                      Consider scheduling your most important tasks during this time window.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted p-4 border">
                    <p className="text-sm">
                      Complete more focus sessions to receive personalized AI
                      insights about your productivity patterns.
                    </p>
                  </div>
                )}
                <div className="rounded-lg bg-blue-500/5 p-4 border border-blue-500/10">
                  <p className="text-sm">
                    <span className="font-medium">Did you know?</span> Research
                    shows that most people are most productive in the morning,
                    with peak focus occurring between 9am and 11am.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="focus">
          <Card>
            <CardContent className="p-6 text-center">
              {analytics && analytics.totalWorkSessions > 0 ? (
                <div className="py-12">
                  <p className="text-muted-foreground mb-4">
                    Focus time analytics visualization coming soon
                  </p>
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    View Detailed Focus Report
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Focus time analytics will be available after you complete your
                  first focus session
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardContent className="p-6 text-center">
              {analytics && analytics.completedTasks > 0 ? (
                <div className="py-12">
                  <p className="text-muted-foreground mb-4">
                    Task analytics visualization coming soon
                  </p>
                  <Button variant="outline">
                    <ListChecks className="h-4 w-4 mr-2" />
                    View Detailed Task Report
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Task analytics will be available after you complete your first
                  task
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardContent className="p-6 text-center">
              {analytics && (analytics.totalWorkSessions > 10 || analytics.completedTasks > 10) ? (
                <div className="py-12">
                  <p className="text-muted-foreground mb-4">
                    Trend analytics visualization coming soon
                  </p>
                  <Button variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Detailed Trends Report
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Trend analytics will be available after you use the app for a
                  while
                </p>
              )}
            </CardContent>
          </Card>
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
